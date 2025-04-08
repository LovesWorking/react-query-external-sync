export let useSyncQueries: typeof import("./react-query-external-sync/useSyncQueries").useSyncQueriesExternal;
// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== "production") {
  useSyncQueries =
    require("./react-query-external-sync/useSyncQueries").useSyncQueries;
} else {
  useSyncQueries = () => ({
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
    socket: null,
    users: [],
  });
}
