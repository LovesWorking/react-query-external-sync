type StatusColorMap = {
  [key: string]: string;
};

const statusToColorClass: StatusColorMap = {
  fresh: "bg-fresh", // Green
  stale: "bg-stale", // Yellow
  fetching: "bg-fetching", // Blue
  paused: "bg-paused", // Indigo
  noObserver: "bg-noObserver", // Grey
};

export function statusTobgColorClass(status: string): string {
  return statusToColorClass[status];
}
