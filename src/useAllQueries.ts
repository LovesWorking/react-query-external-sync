import { useEffect, useState, useRef } from "react";
import { QueryClient } from "@tanstack/react-query";
import { deepEqual } from "fast-equals";
import { Query } from "@tanstack/react-query";
import useMySocket from "./useMySocket ";
import { User } from "./_types/User";
import { ClientQuery } from "./_types/ClientQuery";
export interface ExtendedQuery extends Query {
  observersCount?: number; //  getObserversCount()
  isQueryStale?: boolean; // isStale()
}
interface Props {
  queryClient: QueryClient | any;
  query: ClientQuery;
  socketURL: string;
}
export function useAllQueries({ queryClient, query, socketURL }: Props) {
  const { connect, disconnect, isConnected, socket } = useMySocket({
    query,
    queryClient,
    socketURL,
  });
  const [queries, setQueries] = useState<ExtendedQuery[]>([]);
  // Store the previous data states for comparison
  const prevDataRef = useRef<Array<any>>([]);

  useEffect(() => {
    const updateQueries = () => {
      const allQueries = queryClient.getQueryCache().findAll();
      // Extract the specific parts of the state we want to compare
      const currentDataStates = allQueries.map((query) => ({
        data: query.state.data,
        // dataUpdateCount: query.state.dataUpdateCount,
        // dataUpdatedAt: query.state.dataUpdatedAt,
        error: query.state.error,
        // errorUpdateCount: query.state.errorUpdateCount,
        // errorUpdatedAt: query.state.errorUpdatedAt,
        // fetchFailureCount: query.state.fetchFailureCount,
        fetchFailureReason: query.state.fetchFailureReason,
        fetchMeta: query.state.fetchMeta,
        fetchStatus: query.state.fetchStatus,
        isInvalidated: query.state.isInvalidated,
        status: query.state.status,
      }));
      // Check if the specific parts of the state of any query have changed using deep comparison
      if (!deepEqual(prevDataRef.current, currentDataStates)) {
        console.log("!!!!!Queries changed!!!!!!");
        // add observersCount and isQueryStale to response as they're functions the server dashboard client can't call
        const newAllQueries = allQueries.map((query: Query) => {
          return {
            ...query,
            observersCount: query.getObserversCount(),
            isQueryStale: query.isStale(),
          } as ExtendedQuery;
        });
        setQueries(allQueries);
        prevDataRef.current = currentDataStates; // Update the ref for future comparison
        // Broadcast new queries
        socket.emit("allQueries", newAllQueries);
      }
    };
    // Perform an initial update
    updateQueries();
    // Subscribe to the query cache to run updates on changes
    const unsubscribe = queryClient.getQueryCache().subscribe(updateQueries);

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [queryClient]);
  // Broadcast queries again if we re-connect
  useEffect(() => {
    socket.emit("allQueries", queries);
  }, [isConnected]);
  return { queries, connect, disconnect, isConnected, socket };
}
