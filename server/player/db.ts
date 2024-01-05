import { DbExecute } from "../db";

export function GetUserIdFromIdentifier(identifier: string, offset?: number) {
  return DbExecute<number>(
    "scalar",
    `SELECT userId FROM users WHERE license2 = ? LIMIT ?, 1`,
    [identifier, offset || 0]
  );
}
