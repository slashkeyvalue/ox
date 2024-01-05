import { db } from '../db';

export function GetUserIdFromIdentifier(identifier: string, offset?: number) {
  return db.execute<number>(
    `SELECT userId FROM users WHERE license2 = ? LIMIT ?, 1`,
    [identifier, offset || 0],
    'scalar'
  );
}
