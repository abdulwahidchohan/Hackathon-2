import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Or Orbitron if available, sticking to Inter for now
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hackathon Todo App",
  description: "Futuristic Task Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-cyan-500/30`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
