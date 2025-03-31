// Export the main hook
export { useMySocket as useQuerySyncSocket } from "./useMySocket";

// Export platform utilities for advanced customization
export {
  getPlatform,
  setPlatformOverride,
  getStorage,
  setCustomStorage,
  getPlatformSpecificURL,
  type StorageInterface,
} from "./platformUtils";
