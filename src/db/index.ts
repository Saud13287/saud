import * as schema from "./schema";

let _db: ReturnType<typeof import("@kilocode/app-builder-db").createDatabase> | null = null;

export function getDb() {
  if (!_db) {
    const { createDatabase } = require("@kilocode/app-builder-db");
    _db = createDatabase(schema);
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof import("@kilocode/app-builder-db").createDatabase>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string, unknown>)[prop as string];
  },
});
