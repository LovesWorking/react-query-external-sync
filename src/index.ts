export let useSyncQueriesExternal: typeof import("./react-query-external-sync/useSyncQueriesExternal").useSyncQueriesExternal;
// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== "production") {
  useSyncQueriesExternal =
    require("./react-query-external-sync/useSyncQueriesExternal").useSyncQueriesExternal;
} else {
  // In production, this becomes a no-op function
  useSyncQueriesExternal = () => ({
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
    socket: null,
    users: [],
  });
}
