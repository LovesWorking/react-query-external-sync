import { ExtendedQuery } from "./QueryExternal";
export interface User {
  id: string;
  clientType: string;
  username: string;
  userType: string;
  allQueries: ExtendedQuery[];
}
