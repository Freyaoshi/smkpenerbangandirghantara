import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import path from "path";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

const dbPath = path.resolve(process.cwd(), "sqlite.db");
const dbUrl = process.env.TURSO_DATABASE_URL || `file:${dbPath}`;

const client = createClient({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema: { ...schema, ...authSchema },
});
