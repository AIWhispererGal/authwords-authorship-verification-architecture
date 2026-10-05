import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/dm-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuthWords — Your work. Your voice. Verified.",
  description: "A student-first authorship verification workspace. Explore a privacy-preserving production blueprint, your synthetic writing profile, and cryptographically signed demo credentials.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a>{children}</body></html>;
}
