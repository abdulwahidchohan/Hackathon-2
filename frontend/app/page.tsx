// Phase II — Home: redirect to dashboard or login
// [From]: specs Phase II UI

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default async function HomePage() {
  const session = await authClient.getSession();
  if (session?.data?.user) {
    redirect("/dashboard");
  }
  redirect("/login");
}
