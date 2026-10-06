import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// The pool is created lazily so that `next build`, lint, and unit tests can
// import route modules without a DATABASE_URL. The first query fails loudly instead.
// Exactly one pool is created per process; in development it also survives hot reloads.
const globalForDb = globalThis as typeof globalThis & { __authwordsDb?: NodePgDatabase };
let instance: NodePgDatabase | undefined = process.env.NODE_ENV === "production" ? undefined : globalForDb.__authwordsDb;

function connect(): NodePgDatabase {
  if (instance) return instance;
  // Hosts such as Netlify DB expose the connection string under their own name.
  const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  instance = drizzle(new Pool({ connectionString: databaseUrl }));
  if (process.env.NODE_ENV !== "production") globalForDb.__authwordsDb = instance;
  return instance;
}

export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, property) {
    const target = connect();
    const value = Reflect.get(target, property, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
