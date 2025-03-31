# React Query External Sync

A tool for syncing React Query state to an external React Query Dev Tools instance.

## Features

- Works in both React Native and browser/web environments
- Syncs React Query state between your app and external dev tools
- Automatically detects platform (iOS, Android, Web, etc.)
- Handles platform-specific networking (like Android emulator's 10.0.2.2 for localhost)
- Uses appropriate storage mechanisms based on environment

## Installation

```bash
npm install react-query-external-sync
# or
yarn add react-query-external-sync
```

### React Native Requirements

If you're using this in a React Native project, you'll need to install the following optional dependencies:

```bash
npm install react-native @react-native-async-storage/async-storage
# or
yarn add react-native @react-native-async-storage/async-storage
```

## Usage

```jsx
import { useQuerySyncSocket } from 'react-query-external-sync';

function App() {
  // Set up the sync socket
  useQuerySyncSocket({
    deviceName: 'MyApp', // Name to identify this device
    socketURL: 'http://localhost:42831', // URL to your dev tools instance
  });

  return (
    // Your app components
  );
}
```

## How It Works

This package provides a cross-platform solution for syncing React Query state to external tools:

1. **Platform Detection**: Automatically detects if running in React Native or web environment
2. **Storage Abstraction**: Uses the appropriate storage mechanism:
   - React Native: AsyncStorage (if available)
   - Web: localStorage
   - Fallback: In-memory storage
3. **Network Configuration**: Handles platform-specific networking requirements
   - For Android emulators: Maps localhost to 10.0.2.2
   - For other environments: Uses the provided URL

## Advanced Configuration

### Custom Platform Detection

If you need to override the built-in platform detection:

```jsx
import {
  useQuerySyncSocket,
  setPlatformOverride,
} from "react-query-external-sync";

// Set a custom platform
setPlatformOverride({ os: "customOS", name: "Custom Platform" });

// Use normally after setting override
function App() {
  useQuerySyncSocket({
    deviceName: "MyCustomPlatformApp",
    socketURL: "http://localhost:3000",
  });

  // ...
}
```

### Custom Storage

If you need to provide a custom storage implementation:

```jsx
import {
  useQuerySyncSocket,
  setCustomStorage,
} from "react-query-external-sync";

// Set a custom storage implementation
setCustomStorage({
  getItem: async (key) => {
    /* your implementation */
  },
  setItem: async (key, value) => {
    /* your implementation */
  },
  removeItem: async (key) => {
    /* your implementation */
  },
});

// Use normally after setting custom storage
function App() {
  // ...
}
```

## License

MIT

<br>
<hr>
<br>
