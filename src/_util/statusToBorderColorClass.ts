type StatusColorMap = {
  [key: string]: string;
};

const statusToColorClass: StatusColorMap = {
  fresh: "border-borderFresh", // Green
  stale: "border-borderStale", // Yellow
  fetching: "border-borderFetching", // Blue
  paused: "border-borderPaused", // Indigo
  noObserver: "border-borderNoObserver", // Grey
};

export function statusToBorderColorClass(status: string): string {
  return statusToColorClass[status];
}
