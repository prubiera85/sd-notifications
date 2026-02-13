import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Service Desk Notifications",
  description: "Monitor Linear comments for service desk mentions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
