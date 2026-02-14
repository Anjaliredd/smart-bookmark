import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import BookmarkList from "@/components/BookmarkList";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const displayName =
    user.user_metadata?.full_name ?? user.email ?? "there";

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              🔖 My Bookmarks
            </h1>
            <p className="text-sm text-slate-500">
              Welcome, {displayName}
            </p>
          </div>
          <SignOutButton />
        </header>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Add a new bookmark
          </h2>
          <AddBookmarkForm userId={user.id} />
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Saved bookmarks
          </h2>
          <BookmarkList userId={user.id} />
        </section>
      </div>
    </main>
  );
}