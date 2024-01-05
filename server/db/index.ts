import { getConnection } from "./pool";

type QueryTypes = "row" | "scalar" | "query";
type QueryValues = (string | number)[];
type SqlColumn<T> = T extends any[] ? never : T;
type SqlRow<T> = T extends Dict<any> ? T : never;
type SqlRows<T> = T extends Dict<any>[] ? T : never;

function parseResponse(type: QueryTypes, resp: any) {
  switch (type) {
    case "row":
      return resp[0];
    case "scalar":
      for (const key in resp[0]) return resp[0][key];
    default:
      return resp;
  }
}

export async function DbQuery<T>(
  type: "row",
  query: string,
  values?: QueryValues
): Promise<SqlRow<T> | void>;

export async function DbQuery<T>(
  type: "scalar",
  query: string,
  values?: QueryValues
): Promise<SqlColumn<T> | void>;

export async function DbQuery<T>(
  type: "query",
  query: string,
  values?: QueryValues
): Promise<SqlRows<T>>;

export async function DbQuery<T>(
  type: QueryTypes,
  query: string,
  values?: QueryValues
): Promise<T> {
  using conn = await getConnection()

  return parseResponse(type, await conn.query(query, values));
}

export async function DbExecute<T>(
  type: "row",
  query: string,
  values?: QueryValues
): Promise<SqlRow<T> | void>;

export async function DbExecute<T>(
  type: "scalar",
  query: string,
  values?: QueryValues
): Promise<SqlColumn<T> | void>;

export async function DbExecute<T>(
  type: "query",
  query: string,
  values?: QueryValues
): Promise<SqlRows<T>>;

export async function DbExecute<T>(
  type: QueryTypes,
  query: string,
  values?: QueryValues
): Promise<T> {
  using conn = await getConnection()

  return parseResponse(type, await conn.execute(query, values));
}

export function DbSelect<T>(
  query: string,
  values?: QueryValues
): Promise<SqlRows<T>> {
  return DbQuery("query", query, values);
}

export function DbRow<T>(
  query: string,
  values?: QueryValues
): Promise<SqlRow<T> | void> {
  return DbQuery("row", query, values);
}

export function DbScalar<T>(
  query: string,
  values?: QueryValues
): Promise<SqlColumn<T> | void> {
  return DbQuery("scalar", query, values);
}
