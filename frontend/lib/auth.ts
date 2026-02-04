// Phase II — Better Auth server config (JWT for FastAPI backend)
// [From]: Hackathon spec — Better Auth, BETTER_AUTH_SECRET

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "change-me-in-production",
  basePath: "/api/auth",
  plugins: [jwt()],
  database: {
    type: "sqlite",
    url: process.env.BETTER_AUTH_DATABASE_URL || "file:./auth.db",
  },
});
