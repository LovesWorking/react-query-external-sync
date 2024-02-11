# React Query External Sync

## Introduction

Welcome to **React Query External Sync**! This tool is designed for developers and QA teams to remotely sync and manage React Query state via an external dashboard. It's particularly beneficial for React Native projects, where React Query Dev Tools integration is absent.

## Features

- **Remote State Management**: Allows manipulation and observation of React Query state from an external dashboard.
- **Cross-Platform Compatibility**: Ensures seamless functionality across all React-based platforms.
- **Enhanced Testing Workflow**: Facilitates UI state testing by enabling external adjustments to API states, thus improving testing efficiency.

## Getting Started

### Prerequisites

Your client app should include:
- React version 18 or above
- React Query version 5.17.19 or above
Your socket io server should include:
- socket.io version 4.7.4 or above


### Installation

To install the package, run the following command in the project where you want to remotley manage it's state:

```bash
npm install react-query-external-sync
```

## Steps - client application
- Import useAllQueries and use the hook in your client application:

```javascript
import { useAllQueries } from "react-query-external-sync";

const { connect, disconnect, isConnected, queries, socket, users } =
    useAllQueries({
      query: {
        username: "myUsername",
        userType: "User", // Role of the user
        clientType: "client", // client | server
      },
      queryClient,
      socketURL: "http://localhost:4000",
    });
```
- **query**: An object containing user information.
- **queryClient**: Your React Query client instance.
- **socketURL**: The URL of your socket io server.

 ### Connecting to the Server

Use the `connect` function to establish a connection to the socket server. Check the connection status with `isConnected`. This will allow the app to sync all data between itself and the external dev tools.

### Disconnecting from the Server

Use the `disconnect` function to terminate the connection.

### Accessing Queries

The `queries` property provides access to the synced queries data. Use this for debugging.

### That's it for the client part! Now we'll need to setup the external dashboard!

### Installation

Run the following command in your Node server directory:

```bash
npm install react-query-external-dash
```

## Steps - Socket IO Server
- Import and use the socketHandle function after you create a new SocketIOServer in your server.(ts/js) file:

```javascript
import { socketHandle } from "react-query-external-dash";

  socketHandle({ io });
```

- **socketHandle**: Will handle all messages to and from clients to sync query state.
- **io**: Returned value from calling  new SocketIOServer
- ```javascript
  // Example code to Initialize Socket.IO server with CORS configuration
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "http://localhost:3000", // Frontend URL
      methods: ["GET", "POST"],
    },
  });
  
```

## Displaying React Query dev tools

- Import and use the ExternalDevTools component where you want this tool to be rendered:

```javascript
import { ExternalDevTools } from "react-query-external-dash";

   <ExternalDevTools
      query={{
        clientType: "server",// Client Type needs to be server as this is the server client dashboard.
        username: "Admin",
        userType: "admin",
      }}
      socketURL="http://localhost:4000"
    />

```
