import { Command } from "../_types/Command";
import deleteItem from "../_util/actions/deleteItem";
import invalidate from "../_util/actions/invalidate";
import refetch from "../_util/actions/refetch";
import remove from "../_util/actions/remove";
import reset from "../_util/actions/reset";
import triggerError from "../_util/actions/triggerError";
import triggerLoading from "../_util/actions/triggerLoading";
import { updateNestedDataByPath } from "../_util/updateNestedDataByPath";
import { Query, useQueryClient } from "@tanstack/react-query";
interface Props {
  queryClient: ReturnType<typeof useQueryClient>;
  command: Command;
  allQueries: Query[];
}
export default function handleCommands({
  queryClient,
  command,
  allQueries,
}: Props) {
  const currentDataPath = [] as any; // NOT USED FOR DATA EXPLORER
  const query = allQueries.find(
    (query) => JSON.stringify(query.queryKey) === command.queryKey
  );
  if (!query) {
    console.error("Query not found");
    return;
  }
  switch (command.command) {
    case "Trigger Loading":
      triggerLoading({
        query: query,
      });
      break;
    case "Data Update":
      const oldData = query.state.data;
      // New data to set
      const serverNewData = command.newValue;
      // Set the new data
      const newData = updateNestedDataByPath(
        oldData,
        currentDataPath,
        serverNewData
      );
      queryClient.setQueryData(query.queryKey, newData);
      break;
    case "Invalidate":
      invalidate({ query });
      break;
    case "Refetch":
      refetch({ query });
      break;
    case "Remove":
      remove({ query, queryClient });
      break;
    case "Reset":
      reset({ queryClient, query });
      break;
    case "Trigger Error":
      triggerError({ query, queryClient });
      break;
    case "Trigger Error":
      triggerError({ query, queryClient });
      break;
    case "Data Delete":
      deleteItem({
        queryClient,
        activeQuery: query,
        dataPath: command.dataPath,
      });
      break;
    default:
      break;
  }
}
