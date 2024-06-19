import { TPreparedStatement } from "../../types.ts";

export default interface IClause {
  prepareStatement(): TPreparedStatement;
}
