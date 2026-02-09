// Phase II — Home: redirect to dashboard or login
// [From]: specs Phase II UI

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session) {
    redirect("/dashboard");
  }
  redirect("/login");
}
