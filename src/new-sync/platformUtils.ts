/**
 * Platform and storage utilities that work across different environments (React Native, web, etc.)
 */

// User-defined overrides
let platformOverride: { os: string; name: string } | null = null;
let customStorageImplementation: StorageInterface | null = null;

// Try to detect if we're in a React Native environment
export const isReactNative = (): boolean => {
  try {
    return (
      typeof navigator !== "undefined" && navigator.product === "ReactNative"
    );
  } catch (e) {
    return false;
  }
};

// Platform detection
export const getPlatform = (): { os: string; name: string } => {
  // Return user-defined override if available
  if (platformOverride) {
    return platformOverride;
  }

  try {
    // Try to use React Native Platform if available
    if (isReactNative()) {
      try {
        // Dynamic import to avoid bundling issues
        const { Platform } = require("react-native");
        const os = Platform.OS;
        const name = os.charAt(0).toUpperCase() + os.slice(1);
        return { os, name };
      } catch (e) {
        console.warn("Failed to import Platform from react-native:", e);
      }
    }

    // Fallback to browser detection
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    if (/android/i.test(userAgent)) {
      return { os: "android", name: "Android" };
    }
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return { os: "ios", name: "iOS" };
    }
    if (/Windows/.test(userAgent)) {
      return { os: "windows", name: "Windows" };
    }
    if (/Mac/.test(userAgent)) {
      return { os: "macos", name: "MacOS" };
    }
    if (/Linux/.test(userAgent)) {
      return { os: "linux", name: "Linux" };
    }

    // Default to web if we can't detect the platform
    return { os: "web", name: "Web" };
  } catch (e) {
    console.warn("Error detecting platform:", e);
    return { os: "unknown", name: "Unknown" };
  }
};

/**
 * Override platform detection with a custom value
 * Useful for testing or when the automatic detection isn't working properly
 */
export const setPlatformOverride = (
  platform: { os: string; name: string } | null
): void => {
  platformOverride = platform;
};

// Storage interface similar to AsyncStorage
export interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * Set a custom storage implementation
 * Use this if you need to provide your own storage solution
 */
export const setCustomStorage = (storage: StorageInterface | null): void => {
  customStorageImplementation = storage;
};

// Storage implementation
export const getStorage = (): StorageInterface => {
  // Return user-defined storage if available
  if (customStorageImplementation) {
    return customStorageImplementation;
  }

  // Try to use React Native AsyncStorage if available
  if (isReactNative()) {
    try {
      // Dynamic import to avoid bundling issues
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return AsyncStorage;
    } catch (e) {
      console.warn("Failed to import AsyncStorage from react-native:", e);
    }
  }

  // Fallback to browser localStorage with an async wrapper
  if (typeof localStorage !== "undefined") {
    return {
      getItem: async (key: string): Promise<string | null> => {
        return localStorage.getItem(key);
      },
      setItem: async (key: string, value: string): Promise<void> => {
        localStorage.setItem(key, value);
      },
      removeItem: async (key: string): Promise<void> => {
        localStorage.removeItem(key);
      },
    };
  }

  // Memory fallback if nothing else is available
  console.warn("No persistent storage available, using in-memory storage");
  const memoryStorage: Record<string, string> = {};
  return {
    getItem: async (key: string): Promise<string | null> => {
      return memoryStorage[key] || null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
      memoryStorage[key] = value;
    },
    removeItem: async (key: string): Promise<void> => {
      delete memoryStorage[key];
    },
  };
};

/**
 * Get platform-specific URL for socket connection
 * On Android emulator, we need to replace localhost with 10.0.2.2
 */
export const getPlatformSpecificURL = (baseUrl: string): string => {
  try {
    const platform = getPlatform();
    const url = new URL(baseUrl);

    // For Android emulator, replace hostname with 10.0.2.2
    if (
      platform.os === "android" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    ) {
      url.hostname = "10.0.2.2";
      return url.toString();
    }

    // For other platforms, use as provided
    return baseUrl;
  } catch (e) {
    console.warn("Error getting platform-specific URL:", e);
    return baseUrl;
  }
};
