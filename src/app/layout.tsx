import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jackie Jeans | Smart Fit Onboarding",
  description: "Answer 10 quick questions. We'll find your perfect fit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
