# React Query External Sync

React Query devtool synced with Socket.IO, to debug your react-query outstide your app easily.

## [Preview the devtool](https://github.com/LovesWorking/LovesWorking/assets/111514077/e8c119cc-44bc-48ba-a398-dfba30e44396)

## Table of content

- [Introduction](#introduction)
    - [Key Advantages](#key-advantages)
- [Prerequisites](#prerequisites)
    - [Client Application](#client-application)
    - [Socket IO Server](#socket-io-server)
    - [Devtool Website](#devtool-website)
- [Installation](#installation)
    + [Client](#client)
        - [1. Install the package](#1-install-the-package)
        - [2. Connect your react-query to the socket](#2-connect-your-react-query-to-the-socket)
        - [3. Usages](#3-usages)
    + [Socket IO Server](#socket-io-server)
        - [1. Install the package](#1-install-the-package-1)
        - [2. Setup Socket IO](#2-setup-socket-io)
    + [React Query Dev Tools Server](#react-query-dev-tools-server)
- [Ready to use Docker image](#ready-to-use-docker-image)
    - [1. Image link](#1-image-link)
    - [2. Environment variables](#2-environment-variables)
    - [3. Docker Compose example](#3-docker-compose-example)
- [Contribution](#contribution)

## Introduction

**React Query External Sync** is a dynamic tool for managing React Query state outside the usual confines of React Query Dev Tools. Ideal for React projects, it offers a live state management solution that's accessible to both developers, qa and non-technical team members.

### Key Advantages:
- **Real-time UI Updates**: Instantly see how state changes affect your application's UI without backend alterations.
- **Broad Accessibility**: Enables all team members, including QA, designers, and business professionals, to tweak and test API-driven UI components on the fly.
- **Continuous Evolution**: Built with expansion in mind, expect regular feature updates driven by community feedback and the evolving needs of modern development workflows.
- **Enhanced Manipulation**: Future updates will introduce capabilities for precise state adjustments, such as directly inserting complete objects or arrays, object duplication, simultaneous state syncing across web, Android, and iOS and persistent state overrides, allowing values for specific data to remain until manually reverted.

## Prerequisites

### Client Application

- React version 18 or above.
- React Query version 5.17.19 or above.

### Socket IO Server

- Socket.io version 4.7.4 or above.

### Devtool Website

- Any react.js ready server (vite, rca, ...)

## Installation

### Client

#### 1. Install the package

```bash
npm install react-query-external-sync
```

#### 2. Connect your react-query to the socket

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

#### 3. Usages

- `.connect()`: initiate a connection with the socket server
- `.disconnect()`: terminate the connection to the socket server by invoking the disconnect function
- `.isConnected`: monitor the connection status

### Socket IO Server

#### 1. Install the package

```bash
npm install react-query-external-dash
```

#### 2. Setup Socket IO

- After setting up your Socket.io server, integrate the socketHandle function to manage incoming and outgoing messages related to query state synchronization.
- **Basic socket io Nodejs server example**:

```javascript
import { socketHandle } from "react-query-external-dash"

import("socket.io").then(4000 => {
    const io = new socketIO.Server(socketPort, {
        cors: {
            // This origin is the devtool (see next section), change the port to fit your needs.
            // You'll also need to add the URL of your client if you have any CORS issue
            origin: ["http://localhost:4001"],
            credentials: true,
        },
    })

    socketHandle({ io })

    io.on("connection", client => {
        console.log(`'${client.handshake.query.username}' connected`)
    })
})
```

### React Query Dev Tools Server

- Incorporate the ExternalDevTools component within any React.JS ready server
- **Basic react-vite server example** _(we suppose here that the port is 4001)_:

```javascript
import React from "react"
import ReactDOM from "react-dom/client"
import { ExternalDevTools } from "react-query-external-dash"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ExternalDevTools
            socketURL={"http://localhost:4000"}
            query={{
                clientType: "server",
                username: "Admin",
                userType: "admin",
            }}
        />
    </React.StrictMode>,
)
```

## Ready to use Docker image

If you don't want to setup both Socket.IO + Dedicated React.js server to monitor your app, a Docker image is available to launch those both services at once, with custom ports and CORS urls.

### 1. Image link

https://hub.docker.com/repository/docker/navalex/rq_devtool

### 2. Environment variables

- `SOCKET_PORT`: Port for the Socket.io server
- `DT_PORT`: Port for the Vite server to access your devtool
- `CORS_ORIGINS`: String to specify authorized url's for CORS in form of: "url1,url2,url3,..." (separate with coma without spaces). **Note that the devtool url is automaticly included in the CORS Policy.**

### 3. Docker Compose example

- You'll also need to open both ports to use this image. We suggest to define those in environment variables.

```yaml
services:
    rqDevtools:
        image: navalex/rq_devtool:latest
        ports:
            - ${RQ_DEVTOOLS_PORT}:${RQ_DEVTOOLS_PORT}
            - ${RQ_DEVTOOLS_SOCKET_PORT}:${RQ_DEVTOOLS_SOCKET_PORT}
        environment:
            DT_PORT: ${RQ_DEVTOOLS_PORT}
            SOCKET_PORT: ${RQ_DEVTOOLS_SOCKET_PORT}
            SOCKET_CORS: "http://localhost:8102,http://localhost:5173"
```

## Contribution

I welcome contributions, feedback, and bug reports. Feel free to open an issue or pull request on this GitHub repository.

<br>
<hr>
<br>
