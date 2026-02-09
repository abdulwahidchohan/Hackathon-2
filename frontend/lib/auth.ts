import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import { Pool } from "pg";
import path from "path";

const dbUrl = process.env.BETTER_AUTH_DATABASE_URL || "file:./auth.db";
const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

export const auth = betterAuth({
  database: isPostgres
    ? new Pool({ connectionString: dbUrl })
    : new Database(path.join(process.cwd(), "auth.db")),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
  ],
  session: {
    strategy: "jwt",
  },
} as any);
