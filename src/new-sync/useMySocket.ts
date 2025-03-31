import { useEffect, useRef, useState } from "react";
import { io as socketIO, Socket } from "socket.io-client";

import { User } from "./User";
import {
  getStorage,
  getPlatform,
  getPlatformSpecificURL,
} from "./platformUtils";

interface Props {
  deviceName: string; // Unique name to identify the device
  socketURL: string; // Base URL of the socket server (may be modified based on platform)
  /**
   * When true, enables console logging of socket operations
   * Set to false to silence logs in production environments
   * @default false
   */
  enableDebugLogs?: boolean;
}

// Key for storing the persistent device ID in AsyncStorage
const DEVICE_ID_STORAGE_KEY = "@rn_better_dev_tools_device_id";

/**
 * Create a singleton socket instance that persists across component renders
 * This way multiple components can share the same socket connection
 */
let globalSocketInstance: Socket | null = null;
let currentSocketURL = "";
// Store the deviceId in memory as well
let deviceId: string | null = null;

/**
 * Generates a pseudo-random device ID
 */
const generateDeviceId = (): string => {
  return `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
};

/**
 * Gets or creates a persistent device ID
 */
const getOrCreateDeviceId = async (
  enableDebugLogs = false
): Promise<string> => {
  try {
    // Check if we already have the ID in memory
    if (deviceId) {
      return deviceId;
    }

    // Get the storage implementation
    const storage = getStorage();

    // Try to get from storage
    const storedId = await storage.getItem(DEVICE_ID_STORAGE_KEY);

    if (storedId) {
      deviceId = storedId;
      return storedId;
    }

    // Generate and store a new ID if not found
    const newId = generateDeviceId();
    await storage.setItem(DEVICE_ID_STORAGE_KEY, newId);
    deviceId = newId;
    return newId;
  } catch (error) {
    if (enableDebugLogs) {
      console.error("Failed to get/create device ID:", error);
    }
    // Fallback to a temporary ID if storage fails
    const tempId = generateDeviceId();
    deviceId = tempId;
    return tempId;
  }
};

/**
 * Hook that handles socket connection for device-dashboard communication
 *
 * Features:
 * - Singleton pattern for socket connection
 * - Platform-specific URL handling for iOS/Android/Web
 * - Device name identification
 * - Connection state tracking
 * - User list management
 */
export function useMySocket({
  deviceName,
  socketURL,
  enableDebugLogs = false,
}: Props) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const initialized = useRef(false);
  const [persistentDeviceId, setPersistentDeviceId] = useState<string | null>(
    null
  );

  // For logging clarity
  const logPrefix = `[${deviceName}]`;

  // Utility function for conditional debug logging
  const debugLog = (message: string, ...args: any[]) => {
    if (enableDebugLogs) {
      console.log(message, ...args);
    }
  };

  // Utility function for conditional error logging
  const debugError = (message: string, ...args: any[]) => {
    if (enableDebugLogs) {
      console.error(message, ...args);
    }
  };

  // Get the current platform
  const { name: currentPlatform } = getPlatform();

  // Define event handlers at function root level to satisfy linter
  const onConnect = () => {
    debugLog(`${logPrefix} Socket connected successfully`);
    setIsConnected(true);
  };

  const onDisconnect = (reason: string) => {
    debugLog(`${logPrefix} Socket disconnected. Reason: ${reason}`);
    setIsConnected(false);
  };

  const onUsersUpdate = (newUsers: User[]) => {
    debugLog(
      `${logPrefix} Users updated:`,
      newUsers.map((u) => u.deviceName).join(", ")
    );
    setUsers(newUsers);
  };

  const onConnectError = (error: Error) => {
    debugError(`${logPrefix} Socket connection error:`, error.message);
  };

  const onConnectTimeout = () => {
    debugError(`${logPrefix} Socket connection timeout`);
  };

  // Get persistent device ID
  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getOrCreateDeviceId(enableDebugLogs);
      setPersistentDeviceId(id);
      debugLog(`${logPrefix} Using persistent device ID: ${id}`);
    };

    fetchDeviceId();
  }, [logPrefix, enableDebugLogs]);

  // Main socket initialization - runs only once
  useEffect(() => {
    // Wait until we have a persistent device ID
    if (!persistentDeviceId) {
      return;
    }

    // Only initialize socket once to prevent multiple connections
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    // Get the platform-specific URL
    const platformUrl = getPlatformSpecificURL(socketURL);
    currentSocketURL = platformUrl;

    debugLog(
      `${logPrefix} Platform: ${currentPlatform}, using URL: ${platformUrl}`
    );

    try {
      // Use existing global socket or create a new one
      if (!globalSocketInstance) {
        debugLog(`${logPrefix} Creating new socket instance to ${platformUrl}`);
        globalSocketInstance = socketIO(platformUrl, {
          autoConnect: true,
          query: {
            deviceName,
            deviceId: persistentDeviceId,
            platform: currentPlatform,
          },
          reconnection: false,
          transports: ["websocket"], // Prefer websocket transport for React Native
        });
      } else {
        debugLog(
          `${logPrefix} Reusing existing socket instance to ${platformUrl}`
        );
      }

      socketRef.current = globalSocketInstance;
      setSocket(socketRef.current);

      // Setup error event listener
      socketRef.current.on("connect_error", onConnectError);
      socketRef.current.on("connect_timeout", onConnectTimeout);

      // Check initial connection state
      if (socketRef.current.connected) {
        setIsConnected(true);
        debugLog(`${logPrefix} Socket already connected on init`);
      }

      // Set up event handlers
      socketRef.current.on("connect", onConnect);
      socketRef.current.on("disconnect", onDisconnect);

      // Track list of connected users
      socketRef.current.on("users-update", onUsersUpdate);

      // Clean up event listeners on unmount but don't disconnect
      return () => {
        if (socketRef.current) {
          debugLog(`${logPrefix} Cleaning up socket event listeners`);
          socketRef.current.off("connect", onConnect);
          socketRef.current.off("disconnect", onDisconnect);
          socketRef.current.off("connect_error", onConnectError);
          socketRef.current.off("connect_timeout", onConnectTimeout);
          socketRef.current.off("users-update", onUsersUpdate);
          // Don't disconnect socket on component unmount
          // We want it to remain connected for the app's lifetime
        }
      };
    } catch (error) {
      debugError(`${logPrefix} Failed to initialize socket:`, error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistentDeviceId, enableDebugLogs]);

  // Update the socket query parameters when deviceName changes
  useEffect(() => {
    if (
      socketRef.current &&
      socketRef.current.io.opts.query &&
      persistentDeviceId
    ) {
      debugLog(`${logPrefix} Updating device name in socket connection`);
      socketRef.current.io.opts.query = {
        ...socketRef.current.io.opts.query,
        deviceName,
        deviceId: persistentDeviceId,
        platform: currentPlatform,
      };
    }
  }, [
    deviceName,
    logPrefix,
    persistentDeviceId,
    currentPlatform,
    enableDebugLogs,
  ]);

  // Update the socket URL when socketURL changes
  useEffect(() => {
    // Get platform-specific URL for the new socketURL
    const platformUrl = getPlatformSpecificURL(socketURL);

    // Compare with last known URL to avoid direct property access
    if (
      socketRef.current &&
      currentSocketURL !== platformUrl &&
      persistentDeviceId
    ) {
      debugLog(
        `${logPrefix} Socket URL changed from ${currentSocketURL} to ${platformUrl}`
      );

      try {
        // Only recreate socket if URL actually changed
        socketRef.current.disconnect();
        currentSocketURL = platformUrl;

        debugLog(
          `${logPrefix} Creating new socket connection to ${platformUrl}`
        );
        globalSocketInstance = socketIO(platformUrl, {
          autoConnect: true,
          query: {
            deviceName,
            deviceId: persistentDeviceId,
            platform: currentPlatform,
          },
          reconnection: false,
          transports: ["websocket"], // Prefer websocket transport for React Native
        });

        socketRef.current = globalSocketInstance;
        setSocket(socketRef.current);
      } catch (error) {
        debugError(`${logPrefix} Failed to update socket connection:`, error);
      }
    }
  }, [
    socketURL,
    deviceName,
    logPrefix,
    persistentDeviceId,
    currentPlatform,
    enableDebugLogs,
  ]);

  /**
   * Manually connect to the socket server
   */
  function connect() {
    if (socketRef.current && !socketRef.current.connected) {
      debugLog(`${logPrefix} Manually connecting to socket server`);
      socketRef.current.connect();
    }
  }

  /**
   * Manually disconnect from the socket server
   */
  function disconnect() {
    if (socketRef.current && socketRef.current.connected) {
      debugLog(`${logPrefix} Manually disconnecting from socket server`);
      socketRef.current.disconnect();
    }
  }

  return {
    socket,
    connect,
    disconnect,
    isConnected,
    users,
  };
}
