export let useSyncQueries: typeof import("./useSyncQueries").useSyncQueries;
// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== "production") {
  useSyncQueries = require("./useSyncQueries").useSyncQueries;
} else {
  useSyncQueries = () => ({
    isConnected: false,
  });
}
