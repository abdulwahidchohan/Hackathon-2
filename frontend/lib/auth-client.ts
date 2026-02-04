// Phase II — Better Auth client (get JWT for API calls)
// [From]: Hackathon spec — attach JWT to API requests

import { createAuthClient } from "better-auth/client";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [jwtClient()],
});

export async function getToken(): Promise<string | null> {
  const { data } = await authClient.token();
  return data?.token ?? null;
}
