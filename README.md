# React Query External Sync

## Introduction

Welcome to **React Query External Sync**! This tool is designed for developers and QA teams to remotely manage React Query state via an external dashboard. It's particularly beneficial for React Native projects, where React Query Dev Tools integration is absent.

## Features

- **Remote State Management**: Allows manipulation and observation of React Query state from an external dashboard.
- **Cross-Platform Compatibility**: Ensures seamless functionality across all React-based platforms.
- **Enhanced Testing Workflow**: Facilitates UI state testing by enabling external adjustments to API states, thus improving testing efficiency.

## Getting Started

### Prerequisites

#### Client Application:
- React version 18 or above.
- React Query version 5.17.19 or above.

#### Socket IO Server:
- Socket.io version 4.7.4 or above.

### Installation

Install the package using npm by running the following command in your client project directory:

```bash
npm install react-query-external-sync
```

## Usage
- Import the useAllQueries hook and utilize it within your client application to enable real-time synchronization with the external dashboard.

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
- **query**: Contains user information for identifying and managing connections in the dashboard.
- **queryClient**: Your application's React Query client instance.
- **socketURL**: The URL where your Socket.io server is hosted.

 ### Connecting to the Server

Utilize the connect function to initiate a connection with the socket server. Monitor the connection status using isConnected.

### Disconnecting from the Server

Terminate the connection to the socket server by invoking the disconnect function.

### Accessing Queries

The queries property grants access to the synchronized query data, facilitating debugging and state management.

### Socket IO Server

Run the following command in your Node server directory:

```bash
npm install react-query-external-dash
```

## Socket IO Setup:

-  After setting up your Socket.io server, integrate the socketHandle function to manage incoming and outgoing messages related to query state synchronization.

```javascript
import { socketHandle } from "react-query-external-dash";

  socketHandle({ io });
```

- **io**:  The Socket.IO server instance.

## React Query Dev Tools Integration:

- Incorporate the ExternalDevTools component within your server-side dashboard to display and interact with the synchronized React Query states.

```javascript
import { ExternalDevTools } from "react-query-external-dash";

   <ExternalDevTools
      query={{
        clientType: "server",
        username: "Admin",
        userType: "admin",
      }}
      socketURL="http://localhost:4000"// Use local ip if testing localy for Android ie http://192.168.4.21:4000
    />

```

## Contribution

I welcome contributions, feedback, and bug reports. Feel free to open an issue or pull request on this GitHub repository.
