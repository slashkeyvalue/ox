import { OkPacket, db } from '../db';
import { Character } from './class';

export async function GetUserIdFromIdentifier(identifier: string, offset?: number) {
  using conn = await db.getConnection();
  const resp: { userId: number }[] = await conn.execute('SELECT userId FROM users WHERE license2 = ? LIMIT ?, 1', [
    identifier,
    offset || 0,
  ]);

  return db.scalar(resp);
}

export async function CreateUser(username: string, identifiers: Dict<string>) {
  using conn = await db.getConnection();
  const resp: OkPacket = await conn.execute(
    'INSERT INTO users (username, license2, steam, fivem, discord) VALUES (?, ?, ?, ?, ?)',
    [identifiers]
  );

  return Number(resp.insertId);
}

export async function GetCharacters(userId: number) {
  using conn = await db.getConnection();
  return conn.execute<Partial<Character>[]>(
    'SELECT charId, stateId, firstName, lastName, x, y, z, heading, DATE_FORMAT(lastPlayed, "%d/%m/%Y") AS lastPlayed FROM characters WHERE userId = ? AND deleted IS NULL',
    [userId]
  );
}

export async function SaveCharacterData(values: any[] | any[][], batch?: boolean) {
  using conn = await db.getConnection();
  const query =
    'UPDATE characters SET x = ?, y = ?, z = ?, heading = ?, isDead = ?, lastPlayed = CURRENT_DATE(), health = ?, armour = ?, statuses = ? WHERE charId = ?';

  if (batch) {
    await conn.batch(query, values);

    return;
  }

  await conn.execute(query, values);
}
