import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MateClaw Use Cases — AI Agent Playbook cho Business",
  description:
    "20+ use cases thực chiến với OpenClaw AI agents. Từ setup ban đầu đến automation marketing, development, customer support. Copy prompt & bắt đầu ngay.",
  openGraph: {
    title: "MateClaw Use Cases — AI Agent Playbook",
    description: "20+ use cases thực chiến với OpenClaw AI agents",
    siteName: "MateClaw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
