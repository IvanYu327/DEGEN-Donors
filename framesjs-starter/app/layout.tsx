import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

export const metadata: Metadata = {
  // without a title, warpcast won't validate your frame
  title: "DEGEN Donors",
  description: "...",
};

const myFont = localFont({
  src: "./font/sf-mono-medium.woff",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={myFont.className}>
      <body>{children}</body>
    </html>
  );
}
