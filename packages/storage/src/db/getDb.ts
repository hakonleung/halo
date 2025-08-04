import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

export const getPool = async (postgresUrl: string) => {
  if (!pool) {
    pool = new Pool({
      connectionString: postgresUrl,
    });
  }
  return pool;
};

export const getDb = async (postgresUrl: string) => {
  if (!db) {
    db = drizzle(await getPool(postgresUrl));
  }
  return db;
};
