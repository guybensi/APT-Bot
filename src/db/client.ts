import { Pool } from "pg";
import { env } from "../config/env";

export const db = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD
});
