# React Query External Sync

A powerful debugging tool for React Query state and device storage in any React-based application. Whether you're building for mobile, web, desktop, TV, or VR - this package has you covered. It works seamlessly across all platforms where React runs, with zero configuration to disable in production.

Pairs perfectly with [React Native DevTools](https://github.com/LovesWorking/rn-better-dev-tools) for a complete development experience.

![React Query External Sync Demo](https://github.com/user-attachments/assets/39e5c417-be4d-46af-8138-3589d73fce9f)

### If you need internal React Query dev tools within the device you can use my other package here!

https://github.com/LovesWorking/react-native-react-query-devtools

## ✨ Features

- 🔄 Real-time React Query state synchronization
- 💾 **Device storage monitoring with CRUD operations** - MMKV, AsyncStorage, and SecureStorage
- 📱 Works with any React-based framework (React, React Native, Expo, Next.js, etc.)
- 🖥️ Platform-agnostic: Web, iOS, Android, macOS, Windows, Linux, tvOS, VR - you name it!
- 🔌 Socket.IO integration for reliable communication
- 📊 Query status, data, and error monitoring
- 🏷️ Device type detection (real device vs simulator/emulator)
- ⚡️ Simple integration with minimal setup
- 🧩 Perfect companion to React Native DevTools
- 🛑 Zero-config production safety - automatically disabled in production builds

## 📦 Installation

```bash
# Using npm
npm install --save-dev react-query-external-sync socket.io-client
npm install expo-device  # For automatic device detection

# Using yarn
yarn add -D react-query-external-sync socket.io-client
yarn add expo-device  # For automatic device detection

# Using pnpm
pnpm add -D react-query-external-sync socket.io-client
pnpm add expo-device  # For automatic device detection
```

## 🚀 Quick Start

Add the hook to your application where you set up your React Query context:

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSyncQueriesExternal } from "react-query-external-sync";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as ExpoDevice from "expo-device";
import { storage } from "./mmkv"; // Your MMKV instance

// Create your query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  // Unified storage queries and external sync - all in one hook!
  useSyncQueriesExternal({
    queryClient,
    socketURL: "http://localhost:42831",
    deviceName: Platform.OS,
    platform: Platform.OS,
    deviceId: Platform.OS,
    isDevice: ExpoDevice.isDevice, // Automatically detects real devices vs emulators
    extraDeviceInfo: {
      appVersion: "1.0.0",
    },
    enableLogs: true,
    envVariables: {
      NODE_ENV: process.env.NODE_ENV,
    },
    // Storage monitoring with CRUD operations
    mmkvStorage: storage, // MMKV storage for ['#storage', 'mmkv', 'key'] queries + monitoring
    asyncStorage: AsyncStorage, // AsyncStorage for ['#storage', 'async', 'key'] queries + monitoring
    secureStorage: SecureStore, // SecureStore for ['#storage', 'secure', 'key'] queries + monitoring
    secureStorageKeys: [
      "userToken",
      "refreshToken",
      "biometricKey",
      "deviceId",
    ], // SecureStore keys to monitor
  });

  // Your app content
  return <YourApp />;
}
```

## 🔒 Production Safety

This package is automatically disabled in production builds.

```jsx
// The package handles this internally:
if (process.env.NODE_ENV !== "production") {
  useSyncQueries = require("./new-sync/useSyncQueries").useSyncQueries;
} else {
  // In production, this becomes a no-op function
  useSyncQueries = () => ({
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
    socket: null,
    users: [],
  });
}
```

## 💡 Usage with DevTools

For the best experience, use this package with the [React Native DevTools](https://github.com/LovesWorking/rn-better-dev-tools) application:

1. Download and launch the DevTools application
2. Integrate this package in your React application
3. Start your application
4. DevTools will automatically detect and connect to your running application

> **Note**: For optimal connection, launch DevTools before starting your application.

## ⚙️ Configuration Options

The `useSyncQueriesExternal` hook accepts the following options:

| Option              | Type         | Required | Description                                                             |
| ------------------- | ------------ | -------- | ----------------------------------------------------------------------- |
| `queryClient`       | QueryClient  | Yes      | Your React Query client instance                                        |
| `socketURL`         | string       | Yes      | URL of the socket server (e.g., 'http://localhost:42831')               |
| `deviceName`        | string       | Yes      | Human-readable name for your device                                     |
| `platform`          | string       | Yes      | Platform identifier ('ios', 'android', 'web', 'macos', 'windows', etc.) |
| `deviceId`          | string       | Yes      | Unique identifier for your device                                       |
| `extraDeviceInfo`   | object       | No       | Additional device metadata to display in DevTools                       |
| `enableLogs`        | boolean      | No       | Enable console logging for debugging (default: false)                   |
| `isDevice`          | boolean      | No       | Specify if this is a real device vs simulator/emulator (default: false) |
| `envVariables`      | object       | No       | Environment variables to sync with DevTools                             |
| `mmkvStorage`       | MmkvStorage  | No       | MMKV storage instance for real-time monitoring                          |
| `asyncStorage`      | AsyncStorage | No       | AsyncStorage instance for polling-based monitoring                      |
| `secureStorage`     | SecureStore  | No       | SecureStore instance for secure data monitoring                         |
| `secureStorageKeys` | string[]     | No       | Array of SecureStore keys to monitor (required if using secureStorage)  |

## 🐛 Troubleshooting

### Quick Checklist

1. **DevTools Connection**

   - Look for "Connected" status in the top-left corner of the DevTools app
   - If it shows "Disconnected", restart the DevTools app

2. **No Devices Appearing**

   - Verify the Socket.IO client is installed (`npm list socket.io-client`)
   - Ensure the hook is properly set up in your app
   - Check that `socketURL` matches the DevTools port (default: 42831)
   - Restart both your app and the DevTools

3. **Data Not Syncing**

   - Confirm you're passing the correct `queryClient` instance
   - Set `enableLogs: true` to see connection information

4. **Android Real Device Connection Issues**
   - If using a real Android device with React Native CLI and ADB, ensure `isDevice: true`
   - The package transforms `localhost` to `10.0.2.2` for emulators only
   - Use `ExpoDevice.isDevice` for automatic detection: `import * as ExpoDevice from "expo-device"`
   - Check network connectivity between your device and development machine

That's it! If you're still having issues, visit the [GitHub repository](https://github.com/LovesWorking/react-query-external-sync/issues) for support.

## 🏷️ Device Type Detection

The `isDevice` prop helps the DevTools distinguish between real devices and simulators/emulators. This is **crucial for Android connectivity** - the package automatically handles URL transformation for Android emulators (localhost → 10.0.2.2) but needs to know if you're running on a real device to avoid this transformation.

### ⚠️ Android Connection Issue

On real Android devices using React Native CLI and ADB, the automatic emulator detection can incorrectly transform `localhost` to `10.0.2.2`, breaking WebSocket connections. Setting `isDevice: true` prevents this transformation.

**Recommended approaches:**

```jsx
// Best approach using Expo Device (works with bare React Native too)
import * as ExpoDevice from "expo-device";

useSyncQueriesExternal({
  queryClient,
  socketURL: "http://localhost:42831",
  deviceName: Platform.OS,
  platform: Platform.OS,
  deviceId: Platform.OS,
  isDevice: ExpoDevice.isDevice, // Automatically detects real devices vs emulators
  // ... other props
});

// Alternative: Simple approach using React Native's __DEV__ flag
isDevice: !__DEV__, // true for production/real devices, false for development/simulators

// Alternative: More sophisticated detection using react-native-device-info
import DeviceInfo from 'react-native-device-info';
isDevice: !DeviceInfo.isEmulator(), // Automatically detects if running on emulator

// Manual control for specific scenarios
isDevice: Platform.OS === 'ios' ? !Platform.isPad : Platform.OS !== 'web',
```

## ⚠️ Important Note About Device IDs

The `deviceId` parameter must be **persistent** across app restarts and re-renders. Using a value that changes (like `Date.now()`) will cause each render to be treated as a new device.

**Recommended approaches:**

```jsx
// Simple approach for single devices
deviceId: Platform.OS, // Works if you only have one device per platform

// Better approach for multiple simulators/devices of same type
// Using AsyncStorage, MMKV, or another storage solution
const [deviceId, setDeviceId] = useState(Platform.OS);

useEffect(() => {
  const loadOrCreateDeviceId = async () => {
    // Try to load existing ID
    const storedId = await AsyncStorage.getItem('deviceId');

    if (storedId) {
      setDeviceId(storedId);
    } else {
      // First launch - generate and store a persistent ID
      const newId = `${Platform.OS}-${Date.now()}`;
      await AsyncStorage.setItem('deviceId', newId);
      setDeviceId(newId);
    }
  };

  loadOrCreateDeviceId();
}, []);
```

## 📄 License

MIT

---

Made with ❤️ by [LovesWorking](https://github.com/LovesWorking)
