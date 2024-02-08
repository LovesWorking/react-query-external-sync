import { QueryKey } from "@tanstack/react-query";

export interface QueryDetails {
  key: QueryKey;
  status: string;
  observersCount: number;
  lastUpdated: string;
}
