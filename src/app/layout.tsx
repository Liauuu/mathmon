import type { Metadata, Viewport } from "next";
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
  title: "MathMon | 매스몬",
  description: "AI 수학 문제 및 연습문제 생성 플랫폼",
  applicationName: "매스몬",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "매스몬",
  },
  icons: {
    icon: [{ url: "/icon-512.webp", sizes: "512x512", type: "image/webp" }],
    apple: [{ url: "/icon-512.webp", sizes: "512x512", type: "image/webp" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#C5FF4D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icon-512.webp" />
        <meta name="theme-color" content="#C5FF4D" />
      </head>
      <body className="min-h-full bg-[#111827] font-sans text-white">
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col shadow-2xl shadow-black/50 md:max-w-7xl md:shadow-none lg:max-w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
