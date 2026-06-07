import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageShellProps = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export default function LegalPageShell({
  title,
  updatedAt,
  children,
}: LegalPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-8 pt-8 text-gray-100">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-400 transition-colors hover:text-[#a3e635]"
      >
        ← 홈으로
      </Link>

      <header className="mt-6 border-b border-[#84cc16]/20 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-[#84cc16]/70">
          MathMon · 핑코
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-gray-400">시행일: {updatedAt}</p>
      </header>

      <article className="mt-8 space-y-8 text-sm leading-relaxed text-gray-300">
        {children}
      </article>
    </div>
  );
}
