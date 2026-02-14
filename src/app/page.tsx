import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default async function LandingPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="grid place-items-center min-h-screen bg-slate-50">
      <section className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-800">🔖 Smart Bookmark</h1>
        <p className="text-slate-500 text-sm">
          Your personal bookmark manager. Save links, access them anywhere.
        </p>
        <GoogleSignInButton />
      </section>
    </main>
  );
}