import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        redirect("/login");
    }

    // Fetch tasks server-side
    // We need to fetch from the backend API, but we are on the server so we can't use window.fetch relative URLs easily if we don't have the base URL.
    // We can use the user's ID to fetch directly if we had a direct DB method, but we want to use the API logic.
    // Or we can just pass the user and let the client fetch for now, BUT fetching here is better.

    // To fetch from the FastAPI backend, we need the NEXT_PUBLIC_API_URL.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // NOTE: For better security, we should validate the token against the backend, but we trust the session here.
    // We need to pass the JWT token to the backend. session.session.token might be it?
    // Better Auth sessions usually have a token.

    let initialTasks = [];
    try {
        const token = session.session?.token; // Verify if better-auth exposes this in the server session object
        // If session is cookie based, we might not need a bearer token if we were calling our own Next.js API, 
        // but we are calling an external FastAPI backend.
        // We need to send the token we have.

        if (token) {
            const res = await fetch(`${apiUrl}/api/${session.user.id}/tasks`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                cache: "no-store"
            });
            if (res.ok) {
                initialTasks = await res.json();
            } else {
                console.error("Failed to fetch initial tasks", await res.text());
            }
        }
    } catch (e) {
        console.error("Error fetching initial tasks", e);
    }

    return (
        <DashboardClient
            initialUser={{
                id: session.user.id,
                email: session.user.email
            }}
            initialTasks={initialTasks}
        />
    );
}
