import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { FacebookSDK } from "@/components/FacebookSDK";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Endoros - Influencer Analytics Dashboard",
  description: "Track your influence, understand your audience, grow your reach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${dmSans.className} ${geistMono.variable} antialiased`}
        >
          <FacebookSDK />
          <PostHogProvider>
            <PostHogPageView />
            {children}
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
