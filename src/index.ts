export let useSyncQueries: typeof import("./new-sync/useSyncQueries").useSyncQueriesExternal;
// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== "production") {
  useSyncQueries = require("./new-sync/useSyncQueries").useSyncQueries;
} else {
  useSyncQueries = () => ({
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
    socket: null,
    users: [],
  });
}
