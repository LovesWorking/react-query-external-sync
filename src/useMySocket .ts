import io, { Socket } from "socket.io-client";
import { User } from "./_types/User";
import { useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { Command } from "./_types/Command";
import handleCommands from "./_util/handleCommands";

let socket = null as Socket | null; // Module-level variable to store the socket instance
interface Props {
  query: User;
  socketURL: string;
  queryClient: QueryClient | any;
}
export default function useMySocket({ query, socketURL, queryClient }: Props) {
  const [isConnected, setIsConnected] = useState(!!socket?.connected);
  // TODO: Only send our queries directly to any Server Client User who subscribes to our user
  const [users, setUsers] = useState<User[]>([]);

  // "undefined" means the URL will be computed from the `window.location` object
  // const URL =
  //   process.env.NODE_ENV === "production" ? "" : "http://localhost:4000";

  if (!socket) {
    // Initialize the socket only if it hasn't been already initialized
    socket = io(socketURL, {
      autoConnect: false, // Initially prevent automatic connection
      query,
    });
  }

  function connect() {
    socket?.connect();
  }
  function disconnect() {
    socket?.disconnect();
  }
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    // Listen for command messages from the server
    socket?.on("message", (command: Command) => {
      // All queries
      const allQueries = queryClient.getQueryCache().findAll();
      handleCommands({
        queryClient,
        command,
        allQueries,
      });
    });
    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("users-update", (newUsers: User[]) => {
      setUsers(newUsers);
    });
    // Clean up on unmount
    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("users-update");
      socket?.off("message");
    };
  }, [socket]);
  return { socket, connect, disconnect, isConnected, users };
}
