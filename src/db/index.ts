import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL environment variable is missing. Database operations will fail if executed.");
}

// Neon HTTP driver connection pooling
const sql = neon(databaseUrl || "postgresql://mock:mock@mock.neon.tech/neondb");

export const db = drizzle(sql, { schema });
export type DbClient = typeof db;
