import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "EmergencyConnect — Emergency Communication Platform",
  description: "Emergency communication platform powered by natural language understanding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F7F9FC] text-[#172033] antialiased">
        {children}
      </body>
    </html>
  );
}
