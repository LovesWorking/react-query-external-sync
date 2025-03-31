import { useEffect, useRef, useState } from "react";
import { io as socketIO, Socket } from "socket.io-client";

import { User } from "./User";

interface Props {
  deviceName: string; // Unique name to identify the device
  socketURL: string; // URL of the socket server
}

/**
 * Create a singleton socket instance that persists across component renders
 * This way multiple components can share the same socket connection
 */
let globalSocketInstance: Socket | null = null;
let currentSocketURL = "";

/**
 * Hook that handles socket connection for device-dashboard communication
 *
 * Features:
 * - Singleton pattern for socket connection
 * - Device name identification
 * - Connection state tracking
 * - User list management
 */
export function useMySocket({ deviceName, socketURL }: Props) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const initialized = useRef(false);

  // For logging clarity
  const logPrefix = `[${deviceName}]`;

  // Define event handlers at function root level to satisfy linter
  const onConnect = () => {
    console.log(`${logPrefix} Socket connected successfully`);
    setIsConnected(true);
  };

  const onDisconnect = (reason: string) => {
    console.log(`${logPrefix} Socket disconnected. Reason: ${reason}`);
    setIsConnected(false);
  };

  const onUsersUpdate = (newUsers: User[]) => {
    console.log(
      `${logPrefix} Users updated:`,
      newUsers.map((u) => u.deviceName).join(", ")
    );
    setUsers(newUsers);
  };

  const onConnectError = (error: Error) => {
    console.error(`${logPrefix} Socket connection error:`, error.message);
  };

  const onConnectTimeout = () => {
    console.error(`${logPrefix} Socket connection timeout`);
  };

  // Main socket initialization - runs only once
  useEffect(() => {
    // Only initialize socket once to prevent multiple connections
    if (initialized.current) {
      return;
    }

    initialized.current = true;
    currentSocketURL = socketURL;

    try {
      // Use existing global socket or create a new one
      if (!globalSocketInstance) {
        console.log(
          `${logPrefix} Creating new socket instance to ${socketURL}`
        );
        globalSocketInstance = socketIO(socketURL, {
          autoConnect: true,
          query: { deviceName },
          reconnection: false,
        });
      } else {
        console.log(
          `${logPrefix} Reusing existing socket instance to ${socketURL}`
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
        console.log(`${logPrefix} Socket already connected on init`);
      }

      // Set up event handlers
      socketRef.current.on("connect", onConnect);
      socketRef.current.on("disconnect", onDisconnect);

      // Track list of connected users
      socketRef.current.on("users-update", onUsersUpdate);

      // Clean up event listeners on unmount but don't disconnect
      return () => {
        if (socketRef.current) {
          console.log(`${logPrefix} Cleaning up socket event listeners`);
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
      console.error(`${logPrefix} Failed to initialize socket:`, error);
    }
  }, []);

  // Update the socket query parameters when deviceName changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.io.opts.query) {
      console.log(`${logPrefix} Updating device name in socket connection`);
      socketRef.current.io.opts.query = {
        ...socketRef.current.io.opts.query,
        deviceName,
      };
    }
  }, [deviceName, logPrefix]);

  // Update the socket URL when socketURL changes
  useEffect(() => {
    // Compare with last known URL to avoid direct property access
    if (socketRef.current && currentSocketURL !== socketURL) {
      console.log(
        `${logPrefix} Socket URL changed from ${currentSocketURL} to ${socketURL}`
      );

      try {
        // Only recreate socket if URL actually changed
        socketRef.current.disconnect();
        currentSocketURL = socketURL;

        console.log(
          `${logPrefix} Creating new socket connection to ${socketURL}`
        );
        globalSocketInstance = socketIO(socketURL, {
          autoConnect: true,
          query: { deviceName },
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000, // Connection timeout in ms
        });

        socketRef.current = globalSocketInstance;
        setSocket(socketRef.current);
      } catch (error) {
        console.error(
          `${logPrefix} Failed to update socket connection:`,
          error
        );
      }
    }
  }, [socketURL, deviceName, logPrefix]);

  /**
   * Manually connect to the socket server
   */
  function connect() {
    if (socketRef.current && !socketRef.current.connected) {
      console.log(`${logPrefix} Manually connecting to socket server`);
      socketRef.current.connect();
    }
  }

  /**
   * Manually disconnect from the socket server
   */
  function disconnect() {
    if (socketRef.current && socketRef.current.connected) {
      console.log(`${logPrefix} Manually disconnecting from socket server`);
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
