import { MySqlRow, db } from '../db';

export async function GetUserIdFromIdentifier(identifier: string, offset?: number) {
  using conn = await db.getConnection();

  const resp: MySqlRow<number>[] = await conn.execute('SELECT userId FROM users WHERE license2 = ? LIMIT ?, 1', [
    identifier,
    offset || 0,
  ]);

  return db.scalar(resp);
}
