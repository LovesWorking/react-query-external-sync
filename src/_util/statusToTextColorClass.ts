type StatusColorMap = {
  [key: string]: string;
};

const statusToColorClass: StatusColorMap = {
  fresh: "text-textFresh", // Green
  stale: "text-textStale", // Yellow
  fetching: "text-textFetching", // Blue
  paused: "text-textPaused", // Indigo
  noObserver: "text-textNoObserver", // Grey
};

export function statusToTextColorClass(status: string): string {
  return statusToColorClass[status];
}
