export interface Command {
  queryKey: string;
  command:
    | "Refetch"
    | "Invalidate"
    | "Reset"
    | "Remove"
    | "Trigger Loading"
    | "Trigger Error"
    | "Data Update"
    | "Data Delete";
  data?: any;
  newValue?: any;
  dataPath?: Array<string>;
}
