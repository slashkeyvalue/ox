import { getConnection } from "./pool";

type QueryTypes = "query" | "single" | "scalar";
type QueryValues = (string | number)[];
type SqlColumn<T> = T extends any[] ? never : T;
type SqlRow<T> = T extends Dict<any> ? T : never;
type SqlRows<T> = T extends Dict<any>[] ? T : never;

function parseResponse(type: QueryTypes, resp: any) {
  switch (type) {
    case "single":
      return resp[0];
    case "scalar":
      for (const key in resp[0]) return resp[0][key];
    default:
      return resp;
  }
}

interface Db {
  query<T>(query: string, values?: QueryValues, type?: "query"): Promise<SqlRows<T>>
  query<T>(query: string, values?: QueryValues, type?: "single"): Promise<SqlRow<T> | void>
  query<T>(query: string, values?: QueryValues, type?: "scalar"): Promise<SqlColumn<T> | void>
  execute<T>(query: string, values?: QueryValues, type?: "query"): Promise<SqlRows<T>>
  execute<T>(query: string, values?: QueryValues, type?: "single"): Promise<SqlRow<T> | void>
  execute<T>(query: string, values?: QueryValues, type?: "scalar"): Promise<SqlColumn<T> | void>
  single<T>(query: string, values?: QueryValues): Promise<SqlRow<T> | void>
  scalar<T>(query: string, values?: QueryValues): Promise<SqlColumn<T> | void>
}

export const db: Db = {
  async query(query, values, type = "query") {
    using conn = await getConnection();

    return parseResponse(type, await conn.query(query, values));
  },

  async execute(query, values, type = "query") {
    using conn = await getConnection();

    return parseResponse(type, await conn.execute(query, values));
  },

  async single(query, values?) {
    return db.query(query, values, "single");
  },

  async scalar(query, values?) {
    return db.query(query, values, "scalar");
  }
}
