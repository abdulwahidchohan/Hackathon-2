// Phase II — Better Auth catch-all route
// [From]: better-auth Next.js integration

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
