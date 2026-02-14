"use client";

import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Props {
  userId: string;
}

export default function AddBookmarkForm({ userId }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedUrl) {
      setFeedback("Please fill in both fields.");
      return;
    }

    setBusy(true);
    setFeedback("");

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("bookmarks").insert({
      title: trimmedTitle,
      url: trimmedUrl,
      user_id: userId,
    });

    setBusy(false);

    if (error) {
      setFeedback("Something went wrong. Try again.");
      console.error(error);
    } else {
      setTitle("");
      setUrl("");
      setFeedback("Bookmark saved! ✓");
      // Notify all tabs (including this one) to refresh
      const bc = new BroadcastChannel("bookmark-sync");
      bc.postMessage("added");
      bc.close();
      setTimeout(() => setFeedback(""), 2000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Bookmark title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
        >
          {busy ? "Saving…" : "Add Bookmark"}
        </button>
        {feedback && (
          <span className="text-sm text-slate-500">{feedback}</span>
        )}
      </div>
    </form>
  );
}