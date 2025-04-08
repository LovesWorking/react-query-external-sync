/**
 * Log types supported by the logger
 */
export type LogType = "log" | "warn" | "error";

/**
 * Helper function for controlled logging
 * Only shows logs when enableLogs is true
 * Always shows warnings and errors regardless of enableLogs setting
 */
export function log(
  message: string,
  enableLogs: boolean,
  type: LogType = "log"
): void {
  if (!enableLogs && type === "log") return;
  switch (type) {
    case "warn":
      console.warn(message);
      break;
    case "error":
      console.error(message);
      break;
    default:
      console.log(message);
  }
}
