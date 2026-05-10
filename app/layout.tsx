import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@xyflow/react/dist/style.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ghost AI",
    template: "%s | Ghost AI",
  },
  description: "Ghost AI is a real-time collaborative AI-powered system design workspace. Describe your architecture in plain English and let AI build it for you.",
  keywords: ["system design", "AI architecture", "collaborative design", "technical specification"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorBackground: "var(--background)",
              colorInput: "var(--input)",
              colorInputForeground: "var(--foreground)",
              colorPrimary: "var(--primary)",
              colorForeground: "var(--foreground)",
              colorMuted: "var(--muted)",
              colorMutedForeground: "var(--muted-foreground)",
              colorNeutral: "var(--muted)",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
