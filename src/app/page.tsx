import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#111827] px-6 pb-10 pt-16">
      <header className="shrink-0 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#84cc16] sm:text-5xl">
          매스몬 👾
        </h1>
        <p className="mt-2 text-sm font-medium tracking-widest text-[#84cc16]/70 uppercase">
          MathMon
        </p>
        <p className="mt-4 text-sm text-gray-400">
          늪지대의 수학 몬스터와 배틀을 시작하세요
        </p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center">
        <GoogleLoginButton />
      </div>

      <footer className="shrink-0 text-center text-xs text-gray-500">
        슈렉의 늪 · MathMon © 2026
      </footer>
    </main>
  );
}
