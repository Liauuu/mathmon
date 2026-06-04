import HomeClient from "@/components/HomeClient";

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
      </header>

      <HomeClient />
    </main>
  );
}
