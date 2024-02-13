# React Query External Sync

![react-query-external-preview](https://github.com/LovesWorking/LovesWorking/assets/111514077/e8c119cc-44bc-48ba-a398-dfba30e44396)

## Introduction

**React Query External Sync** is a dynamic tool for managing React Query state outside the usual confines of React Query Dev Tools. Ideal for React Native projects, it offers a live state management solution that's accessible to both developers and non-technical team members.

### Key Advantages:
- **Real-time UI Updates**: Instantly see how state changes affect your application's UI without backend alterations.
- **Broad Accessibility**: Enables all team members, including QA, designers, and business professionals, to tweak and test API-driven UI components on the fly.
- **Continuous Evolution**: Built with expansion in mind, expect regular feature updates driven by community feedback and the evolving needs of modern development workflows.
- **Enhanced Manipulation**: Future updates will introduce capabilities for precise state adjustments, such as directly inserting complete objects or arrays, object duplication, simultaneous state syncing across web, Android, and iOS and persistent state overrides, allowing values for specific data to remain until manually reverted.

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
