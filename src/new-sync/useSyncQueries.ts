import { useEffect, useRef } from "react";
import type { QueryKey } from "@tanstack/query-core";
import { onlineManager, QueryClient } from "@tanstack/react-query";

import { Dehydrate } from "./hydration";
import { SyncMessage } from "./types";
import { useMySocket } from "./useMySocket";

/**
 * Query actions that can be performed on a query.
 * These actions are used to synchronize query state between devices and the dashboard.
 */
type QueryActions =
  // Regular query actions
  | "ACTION-REFETCH" // Refetch a query without invalidating it
  | "ACTION-INVALIDATE" // Invalidate a query and trigger a refetch
  | "ACTION-RESET" // Reset a query to its initial state
  | "ACTION-REMOVE" // Remove a query from the cache
  | "ACTION-DATA-UPDATE" // Update a query's data manually
  // Error handling actions
  | "ACTION-TRIGGER-ERROR" // Manually trigger an error state
  | "ACTION-RESTORE-ERROR" // Restore from an error state
  // Loading state actions
  | "ACTION-TRIGGER-LOADING" // Manually trigger a loading state
  | "ACTION-RESTORE-LOADING" // Restore from a loading state
  // Online status actions
  | "ACTION-ONLINE-MANAGER-ONLINE" // Set online manager to online
  | "ACTION-ONLINE-MANAGER-OFFLINE" // Set online manager to offline
  // Internal action
  | "success"; // Internal success action

/**
 * Message structure for query actions between dashboard and devices
 */
interface QueryActionMessage {
  queryHash: string; // Unique hash of the query
  queryKey: QueryKey; // Key array used to identify the query
  data: unknown; // Data payload (if applicable)
  action: QueryActions; // Action to perform
  targetDevice: string; // Device to target ('All' for all devices)
}

/**
 * Message structure for device information
 */
interface DeviceInfoMessage {
  deviceName: string;
}

/**
 * Determines if a message should be processed by the current device
 */
function shouldProcessMessage(
  targetDevice: string,
  currentDeviceName: string
): boolean {
  return targetDevice === currentDeviceName || targetDevice === "All";
}

/**
 * Verifies if the React Query version is compatible with dev tools
 */
function checkVersion(queryClient: QueryClient) {
  // Basic version check
  const version = (
    queryClient as unknown as {
      getDefaultOptions?: () => { queries?: { version?: unknown } };
    }
  ).getDefaultOptions?.()?.queries?.version;
  if (
    version &&
    !version.toString().startsWith("4") &&
    !version.toString().startsWith("5")
  ) {
    console.warn(
      "This version of React Query has not been tested with the dev tools plugin. Some features might not work as expected."
    );
  }
}

interface useSyncQueriesProps {
  queryClient: QueryClient;
  deviceName: string;
  socketURL: string;
}

/**
 * Hook used by mobile devices to sync query state with the external dashboard
 *
 * Handles:
 * - Connection to the socket server
 * - Responding to dashboard requests
 * - Processing query actions from the dashboard
 * - Sending query state updates to the dashboard
 */
export function useSyncQueriesExternal({
  queryClient,
  deviceName,
  socketURL,
}: useSyncQueriesProps) {
  const { connect, disconnect, isConnected, socket, users } = useMySocket({
    deviceName,
    socketURL,
  });

  // Use a ref to track previous connection state to avoid duplicate logs
  const prevConnectedRef = useRef(false);

  useEffect(() => {
    checkVersion(queryClient);

    // Only log connection state changes to reduce noise
    if (prevConnectedRef.current !== isConnected) {
      if (!isConnected) {
        console.log(`[${deviceName}] Not connected to external dashboard`);
      } else {
        console.log(`[${deviceName}] Connected to external dashboard`);
      }
      prevConnectedRef.current = isConnected;
    }

    // Don't proceed with setting up event handlers if not connected
    if (!isConnected || !socket) {
      return;
    }

    // --- Event Handlers ---

    // Handle initial state requests from dashboard
    const initialStateSubscription = socket.on("request-initial-state", () => {
      console.log(`[${deviceName}] Dashboard is requesting initial state`);
      const dehydratedState = Dehydrate(queryClient as unknown as QueryClient);
      const syncMessage: SyncMessage = {
        type: "dehydrated-state",
        state: dehydratedState,
        deviceName,
        isOnlineManagerOnline: onlineManager.isOnline(),
      };
      socket.emit("query-sync", syncMessage);
      console.log(
        `[${deviceName}] Sent initial state to dashboard (${dehydratedState.queries.length} queries)`
      );
    });

    // Online manager handler - Handle device internet connection state changes
    const onlineManagerSubscription = socket.on(
      "online-manager",
      (message: QueryActionMessage) => {
        const { action, targetDevice } = message;

        // Only process if this message targets the current device
        if (!shouldProcessMessage(targetDevice, deviceName)) {
          return;
        }

        console.log(
          `[${deviceName}] Received online-manager action: ${action}`
        );

        switch (action) {
          case "ACTION-ONLINE-MANAGER-ONLINE": {
            console.log(`[${deviceName}] Set online state: ONLINE`);
            onlineManager.setOnline(true);
            break;
          }
          case "ACTION-ONLINE-MANAGER-OFFLINE": {
            console.log(`[${deviceName}] Set online state: OFFLINE`);
            onlineManager.setOnline(false);
            break;
          }
        }
      }
    );

    // Query Actions handler - Process actions from the dashboard
    const queryActionSubscription = socket.on(
      "query-action",
      (message: QueryActionMessage) => {
        const { queryHash, queryKey, data, action, targetDevice } = message;

        // Skip if not targeted at this device
        if (!shouldProcessMessage(targetDevice, deviceName)) {
          return;
        }

        console.log(
          `[${deviceName}] Received query action: ${action} for query ${queryHash}`
        );

        const activeQuery = queryClient.getQueryCache().get(queryHash);
        if (!activeQuery) {
          console.warn(
            `[${deviceName}] Query with hash ${queryHash} not found`
          );
          return;
        }

        switch (action) {
          case "ACTION-DATA-UPDATE": {
            console.log(`[${deviceName}] Updating data for query:`, queryKey);
            queryClient.setQueryData(queryKey, data, {
              updatedAt: Date.now(),
            });
            break;
          }

          case "ACTION-TRIGGER-ERROR": {
            console.log(
              `[${deviceName}] Triggering error state for query:`,
              queryKey
            );
            const error = new Error("Unknown error from devtools");

            const __previousQueryOptions = activeQuery.options;
            activeQuery.setState({
              status: "error",
              error,
              fetchMeta: {
                ...activeQuery.state.fetchMeta,
                // @ts-expect-error This does exist
                __previousQueryOptions,
              },
            });
            break;
          }
          case "ACTION-RESTORE-ERROR": {
            console.log(
              `[${deviceName}] Restoring from error state for query:`,
              queryKey
            );
            queryClient.resetQueries(activeQuery);
            break;
          }
          case "ACTION-TRIGGER-LOADING": {
            if (!activeQuery) return;
            console.log(
              `[${deviceName}] Triggering loading state for query:`,
              queryKey
            );
            const __previousQueryOptions = activeQuery.options;
            // Trigger a fetch in order to trigger suspense as well.
            activeQuery.fetch({
              ...__previousQueryOptions,
              queryFn: () => {
                return new Promise(() => {
                  // Never resolve - simulates perpetual loading
                });
              },
              gcTime: -1,
            });
            activeQuery.setState({
              data: undefined,
              status: "pending",
              fetchMeta: {
                ...activeQuery.state.fetchMeta,
                // @ts-expect-error This does exist
                __previousQueryOptions,
              },
            });
            break;
          }
          case "ACTION-RESTORE-LOADING": {
            console.log(
              `[${deviceName}] Restoring from loading state for query:`,
              queryKey
            );
            const previousState = activeQuery.state;
            const previousOptions = activeQuery.state.fetchMeta
              ? (
                  activeQuery.state.fetchMeta as unknown as {
                    __previousQueryOptions: unknown;
                  }
                ).__previousQueryOptions
              : null;

            activeQuery.cancel({ silent: true });
            activeQuery.setState({
              ...previousState,
              fetchStatus: "idle",
              fetchMeta: null,
            });

            if (previousOptions) {
              activeQuery.fetch(previousOptions);
            }
            break;
          }
          case "ACTION-RESET": {
            console.log(`[${deviceName}] Resetting query:`, queryKey);
            queryClient.resetQueries(activeQuery);
            break;
          }
          case "ACTION-REMOVE": {
            console.log(`[${deviceName}] Removing query:`, queryKey);
            queryClient.removeQueries(activeQuery);
            break;
          }
          case "ACTION-REFETCH": {
            console.log(`[${deviceName}] Refetching query:`, queryKey);
            const promise = activeQuery.fetch();
            promise.catch((error) => {
              // Log fetch errors but don't propagate them
              console.error(
                `[${deviceName}] Refetch error for ${queryHash}:`,
                error
              );
            });
            break;
          }
          case "ACTION-INVALIDATE": {
            console.log(`[${deviceName}] Invalidating query:`, queryKey);
            queryClient.invalidateQueries(activeQuery);
            break;
          }
          case "ACTION-ONLINE-MANAGER-ONLINE": {
            console.log(`[${deviceName}] Setting online state: ONLINE`);
            onlineManager.setOnline(true);
            break;
          }
          case "ACTION-ONLINE-MANAGER-OFFLINE": {
            console.log(`[${deviceName}] Setting online state: OFFLINE`);
            onlineManager.setOnline(false);
            break;
          }
        }
      }
    );

    // Subscribe to query changes and sync to dashboard
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // Dehydrate the current state
      const dehydratedState = Dehydrate(queryClient as unknown as QueryClient);

      // Create sync message
      const syncMessage: SyncMessage = {
        type: "dehydrated-state",
        state: dehydratedState,
        deviceName,
        isOnlineManagerOnline: onlineManager.isOnline(),
      };

      // Send message to dashboard
      socket.emit("query-sync", syncMessage);
    });

    // Handle device info request - Send device info to dashboard
    const deviceInfoSubscription = socket.on("device-request", () => {
      console.log(`[${deviceName}] Dashboard requested device info`);
      const syncMessage: DeviceInfoMessage = {
        deviceName,
      };
      socket.emit("device-info", syncMessage);
    });

    // Cleanup function to unsubscribe from all events
    return () => {
      console.log(`[${deviceName}] Cleaning up event listeners`);
      queryActionSubscription?.off();
      initialStateSubscription?.off();
      onlineManagerSubscription?.off();
      unsubscribe();
      deviceInfoSubscription?.off();
    };
  }, [queryClient, socket, deviceName, isConnected]);

  return { connect, disconnect, isConnected, socket, users };
}
