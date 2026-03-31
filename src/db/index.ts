import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

let _db: ReturnType<typeof createDatabase<typeof schema>> | null = null;
let _dbError: Error | null = null;

function tryCreateDb() {
  if (_dbError) throw _dbError;
  if (_db) return _db;
  try {
    _db = createDatabase(schema);
    return _db;
  } catch (e) {
    _dbError = e instanceof Error ? e : new Error(String(e));
    throw _dbError;
  }
}

export function isDbAvailable(): boolean {
  return !!(process.env.DB_URL && process.env.DB_TOKEN);
}

export function getDb() {
  return tryCreateDb();
}

// Proxy that lazily initializes the database on first access
export const db = new Proxy({} as ReturnType<typeof createDatabase<typeof schema>>, {
  get(_target, prop) {
    const database = tryCreateDb();
    const value = database[prop as keyof typeof database];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});
