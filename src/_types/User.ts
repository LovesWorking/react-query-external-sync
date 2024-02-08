import { ExtendedQuery } from "./QueryExternal";
export interface User {
  id: String;
  clientType: String;
  username: String;
  userType: String;
  allQueries: ExtendedQuery[];
}
