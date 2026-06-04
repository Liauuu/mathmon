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
  title: "MathMon | 매스몬",
  description: "슈렉 늪지대에서 시작하는 수학 몬스터 배틀",
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
      <body className="min-h-full bg-[#111827] font-sans text-white">
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col shadow-2xl shadow-black/50">
          {children}
        </div>
      </body>
    </html>
  );
}
