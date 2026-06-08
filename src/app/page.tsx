import AppHeader from "@/components/AppHeader";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#111827] px-6 pb-10 pt-6">
      <AppHeader />
      <HomeClient />
    </main>
  );
}
