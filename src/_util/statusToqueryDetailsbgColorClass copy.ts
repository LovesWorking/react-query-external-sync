type StatusColorMap = {
  [key: string]: string;
};

const statusToColorClass: StatusColorMap = {
  fresh: "bg-queryDetailsbgFresh", // Green
  stale: "bg-queryDetailsbgStale", // Yellow
  fetching: "bg-queryDetailsbgFetching", // Blue
  paused: "bg-queryDetailsbgPaused", // Indigo
  noObserver: "bg-queryDetailsbgNoObserver", // Grey
};

export function statusToqueryDetailsbgColorClass(status: string): string {
  return statusToColorClass[status];
}
