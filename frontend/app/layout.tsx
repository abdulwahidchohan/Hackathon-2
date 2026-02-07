import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evolution of Todo",
  description: "Phase II — Full-stack todo app (Hackathon II)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
