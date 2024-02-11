# React Query External Sync

## Introduction

Welcome to **React Query External Sync**! This tool is designed for developers and QA teams to remotely sync and manage React Query state via an external dashboard. It's particularly beneficial for React Native projects, where React Query Dev Tools integration is absent.

## Features

- **Remote State Management**: Allows manipulation and observation of React Query state from an external dashboard.
- **Cross-Platform Compatibility**: Ensures seamless functionality across all React-based platforms.
- **Enhanced Testing Workflow**: Facilitates UI state testing by enabling external adjustments to API states, thus improving testing efficiency.

## Getting Started

### Prerequisites

Your project should include:
- React version 18 or above
- React Query version 5.17.19 or above

### Installation

To install the package, run the following command in your project directory:

```bash
npm install react-query-external-sync
```

## Usage
To integrate React Query External Sync into your project, follow these steps:
- Import and use the hook in your application:

```javascript
import { useAllQueries } from "react-query-external-sync";

const { connect, disconnect, isConnected, queries, socket, users } =
    useAllQueries({
      query: {
        username: "myUsername",
        userType: "User", // Role of the user
        clientType: "browser", // Browser | Server Dashboard
      },
      queryClient,
      socketURL: "http://localhost:4000",
    });
```
- **query**: An object containing user information.
- **queryClient**: Your React Query client instance.
- **socketURL**: The URL of your socket server.

 ### Connecting to the Server

Use the `connect` function to establish a connection to the socket server. Check the connection status with `isConnected`. This will allow the current app to automatically sync all data between itself and the remote dev tools.

### Disconnecting from the Server

Use the `disconnect` function to terminate the connection.

### Accessing Queries

The `queries` property provides access to the synced queries data. Use this for debugging.

