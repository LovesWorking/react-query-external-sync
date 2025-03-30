import {
  DefaultError,
  MutationMeta,
  MutationScope,
  MutationState,
  QueryKey,
  QueryMeta,
  QueryObserverOptions,
  QueryState,
  MutationKey,
} from "@tanstack/react-query";
// Define a simplified version of DehydratedState that both versions can work with
export interface SimpleDehydratedState {
  mutations: any[];
  queries: any[];
}

export interface SyncMessage {
  type: "dehydrated-state";
  state: DehydratedState;
  isOnlineManagerOnline: boolean;
}

export interface DehydratedState {
  mutations: DehydratedMutation[];
  queries: DehydratedQuery[];
}

export interface DehydratedMutation {
  mutationId: number;
  mutationKey?: MutationKey;
  state: MutationState;
  meta?: MutationMeta;
  scope?: MutationScope;
}
export interface DehydratedQuery {
  queryHash: string;
  queryKey: QueryKey;
  state: QueryState;
  promise?: Promise<unknown>;
  meta?: QueryMeta;
  observers: ObserverState[];
}
export interface ObserverState<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> {
  queryHash: string;
  options: QueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >;
}
