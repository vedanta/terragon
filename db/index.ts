import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// A valid-looking fallback keeps module load safe during builds without env.
// neon() does not connect until a query runs, so real env is only needed at runtime.
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://user:password@localhost:5432/placeholder";

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
