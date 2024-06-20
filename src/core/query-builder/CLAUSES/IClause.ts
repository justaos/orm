import type { TPreparedStatement } from "../../types.ts";

export default interface IClause {
  prepareStatement(): TPreparedStatement;
}
