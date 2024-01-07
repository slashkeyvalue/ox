import { Sleep } from '../../common';
import { CHARACTER_SLOTS } from '../../common/config';
import { MySqlRow, OkPacket, db } from '../db';

export async function GetUserIdFromIdentifier(identifier: string, offset?: number) {
  const conn = await db.getConnection();
  const resp: { userId: number }[] = await conn.execute('SELECT userId FROM users WHERE license2 = ? LIMIT ?, 1', [
    identifier,
    offset || 0,
  ]);

  conn.release();
  return db.scalar(resp);
}

export async function CreateUser(username: string, identifiers: Dict<string>) {
  const conn = await db.getConnection();
  const resp: OkPacket = await conn.execute(
    'INSERT INTO users (username, license2, steam, fivem, discord) VALUES (?, ?, ?, ?, ?)',
    [username, identifiers.license2, identifiers.steam, identifiers.fivem, identifiers.discord]
  );

  conn.release();
  return Number(resp.insertId);
}

export async function IsStateIdAvailable(stateId: string) {
  const conn = await db.getConnection();
  const resp: MySqlRow<number>[] = await conn.execute('SELECT 1 FROM characters WHERE stateId = ?', [stateId]);

  conn.release();
  return !db.scalar(resp);
}

export async function CreateCharacter(
  userId: number,
  stateId: string,
  firstName: string,
  lastName: string,
  gender: string,
  date: number,
  phoneNumber?: number
) {
  const conn = await db.getConnection();
  const resp: OkPacket = await conn.execute(
    'INSERT INTO characters (userId, stateId, firstName, lastName, gender, dateOfBirth, phoneNumber) VALUES (?, ?, ?, ?, ?, FROM_UNIXTIME(?), ?)',
    [userId, stateId, firstName, lastName, gender, date / 1000, phoneNumber]
  );

  conn.release();
  return Number(resp.insertId);
}

export async function GetCharacters(userId: number) {
  const conn = await db.getConnection();
  const resp = conn.execute<Partial<Character>[]>(
    'SELECT charId, stateId, firstName, lastName, x, y, z, heading, DATE_FORMAT(lastPlayed, "%d/%m/%Y") AS lastPlayed FROM characters WHERE userId = ? AND deleted IS NULL LIMIT ?',
    [userId, CHARACTER_SLOTS]
  );

  conn.release();
  return resp;
}

export async function SaveCharacterData(values: any[] | any[][], batch?: boolean) {
  const conn = await db.getConnection();
  const query =
    'UPDATE characters SET x = ?, y = ?, z = ?, heading = ?, isDead = ?, lastPlayed = CURRENT_DATE(), health = ?, armour = ?, statuses = ? WHERE charId = ?';

  if (batch) await conn.batch(query, values);
  else await conn.execute(query, values);

  conn.release();
}

export async function DeleteCharacter(charId: number) {
  const conn = await db.getConnection();
  const resp: OkPacket = await conn.execute('UPDATE characters SET deleted = curdate() WHERE charId = ?', [charId]);

  conn.release()
  return resp.affectedRows === 1;
}
