import type { QueryKey } from "@tanstack/query-core";
import { onlineManager, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { Dehydrate } from "./hydration";
import { SyncMessage } from "./types";
import { ClientQuery } from "../_types/ClientQuery";
import useMySocket from "../useMySocket ";
// Use type-only imports to prevent runtime dependencies
type QueryActions =
  | "ACTION-REFETCH"
  | "ACTION-INVALIDATE"
  | "ACTION-TRIGGER-ERROR"
  | "ACTION-RESTORE-ERROR"
  | "ACTION-RESET"
  | "ACTION-REMOVE"
  | "ACTION-TRIGGER-LOADING"
  | "ACTION-RESTORE-LOADING"
  | "ACTION-DATA-UPDATE"
  | "ACTION-ONLINE-MANAGER-ONLINE"
  | "ACTION-ONLINE-MANAGER-OFFLINE"
  | "success";
interface QueryActionMessage {
  queryHash: string;
  queryKey: QueryKey;
  data: unknown;
  action: QueryActions;
  targetDevice: string;
}
interface Props {
  queryClient: QueryClient;
}

function shouldProcessMessage(
  targetDevice: string,
  currentDeviceName: string
): boolean {
  const shouldProcess =
    targetDevice === currentDeviceName || targetDevice === "All";
  return shouldProcess;
}

function checkVersion(queryClient: QueryClient) {
  // Basic version check
  const version = (queryClient as any).getDefaultOptions?.()?.queries?.version;
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
  queryClient: QueryClient | any;
  query: ClientQuery;
  socketURL: string;
}
export function useSyncQueries({
  queryClient,
  query,
  socketURL,
}: useSyncQueriesProps) {
  const { connect, disconnect, isConnected, socket, users } = useMySocket({
    query,
    queryClient,
    socketURL,
  });

  useEffect(() => {
    checkVersion(queryClient);
    if (!socket) {
      console.log("Not connected to external dashboard - No Socket");
      return;
    }
    console.log("Connected to external dashboard");
    // Handle initial state requests from web
    const initialStateSubscription = client.addMessageListener(
      "request-initial-state",
      () => {
        const dehydratedState = Dehydrate(queryClient as any);
        const syncMessage: SyncMessage = {
          type: "dehydrated-state",
          state: dehydratedState,
          Device,
          isOnlineManagerOnline: onlineManager.isOnline(),
        };
        client.sendMessage("query-sync", syncMessage);
      }
    );
    // Online manager handler - Turn device internet connection on/off
    const onlineManagerSubscription = client.addMessageListener(
      "online-manager",
      (message: QueryActionMessage) => {
        const { action, targetDevice } = message;
        // Only process if the target device is the current device or "All"
        if (targetDevice !== Device.deviceName && targetDevice !== "All") {
          return;
        }
        switch (action) {
          case "ACTION-ONLINE-MANAGER-ONLINE": {
            onlineManager.setOnline(true);
            break;
          }
          case "ACTION-ONLINE-MANAGER-OFFLINE": {
            onlineManager.setOnline(false);
            break;
          }
        }
      }
    );
    // Query Actions handler - Update query data, trigger errors, etc.
    const queryActionSubscription = client.addMessageListener(
      "query-action",
      (message: QueryActionMessage) => {
        const { queryHash, queryKey, data, action, targetDevice } = message;

        // Centralize the device check
        if (!shouldProcessMessage(targetDevice, Device.deviceName || "")) {
          return;
        }

        const activeQuery = queryClient.getQueryCache().get(queryHash);
        if (!activeQuery) {
          console.warn(`Query with hash ${queryHash} not found`);
          return;
        }

        switch (action) {
          case "ACTION-DATA-UPDATE": {
            queryClient.setQueryData(queryKey, data, {
              updatedAt: Date.now(),
            });
            break;
          }

          case "ACTION-TRIGGER-ERROR": {
            const error = new Error("Unknown error from devtools");

            const __previousQueryOptions = activeQuery.options;
            activeQuery.setState({
              status: "error",
              error,
              fetchMeta: {
                ...activeQuery.state.fetchMeta,
                // @ts-ignore This does exist
                __previousQueryOptions,
              },
            });
            break;
          }
          case "ACTION-RESTORE-ERROR": {
            queryClient.resetQueries(activeQuery);
            break;
          }
          case "ACTION-TRIGGER-LOADING": {
            if (!activeQuery) return;
            const __previousQueryOptions = activeQuery.options;
            // Trigger a fetch in order to trigger suspense as well.
            activeQuery.fetch({
              ...__previousQueryOptions,
              queryFn: () => {
                return new Promise(() => {
                  // Never resolve
                });
              },
              gcTime: -1,
            });
            activeQuery.setState({
              data: undefined,
              status: "pending",
              fetchMeta: {
                ...activeQuery.state.fetchMeta,
                // @ts-ignore This does exist
                __previousQueryOptions,
              },
            });
            break;
          }
          case "ACTION-RESTORE-LOADING": {
            const previousState = activeQuery.state;
            const previousOptions = activeQuery.state.fetchMeta
              ? (activeQuery.state.fetchMeta as any).__previousQueryOptions
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
            queryClient.resetQueries(activeQuery);
            break;
          }
          case "ACTION-REMOVE": {
            queryClient.removeQueries(activeQuery);
            break;
          }
          case "ACTION-REFETCH": {
            const promise = activeQuery.fetch();
            promise.catch(() => {});
            break;
          }
          case "ACTION-INVALIDATE": {
            queryClient.invalidateQueries(activeQuery);
            break;
          }
          case "ACTION-ONLINE-MANAGER-ONLINE": {
            onlineManager.setOnline(true);
            break;
          }
          case "ACTION-ONLINE-MANAGER-OFFLINE": {
            onlineManager.setOnline(false);
            break;
          }
        }
      }
    );

    // Subscribe to query changes - Send query state to web
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // Dehydrate the current state
      const dehydratedState = Dehydrate(queryClient as any);
      // Create sync message
      const syncMessage: SyncMessage = {
        type: "dehydrated-state",
        state: dehydratedState,
        Device,
        isOnlineManagerOnline: onlineManager.isOnline(),
      };
      // Send message to web
      client.sendMessage("query-sync", syncMessage);
    });
    // Handle device info request - Send device info to web
    const deviceInfoSubscription = client.addMessageListener(
      "device-request",
      () => {
        const syncMessage: DeviceInfoMessage = {
          Device,
        };
        client.sendMessage("device-info", syncMessage);
      }
    );
    return () => {
      queryActionSubscription?.remove();
      initialStateSubscription?.remove();
      onlineManagerSubscription?.remove();
      unsubscribe();
      deviceInfoSubscription?.remove();
    };
  }, [queryClient, client]);

  return { isConnected: !!client };
}
