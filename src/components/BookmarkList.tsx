"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  saved_at: string;
}

interface Props {
  userId: string;
}

export default function BookmarkList({ userId }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(getSupabaseBrowserClient());
  const supabase = supabaseRef.current;

  const loadBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("saved_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data);
    }
    setLoading(false);
  }, [supabase, userId]);

  // Initial fetch
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Realtime: listen for postgres_changes
  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks-realtime`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        () => {
          console.log("Realtime change detected, refreshing...");
          loadBookmarks();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadBookmarks]);

  // Fallback: poll every 2 seconds using BroadcastChannel API
  // This handles cross-tab updates even if Supabase realtime fails
  useEffect(() => {
    const bc = new BroadcastChannel("bookmark-sync");

    // Listen for messages from other tabs
    bc.onmessage = () => {
      console.log("Cross-tab sync: refreshing bookmarks");
      loadBookmarks();
    };

    return () => {
      bc.close();
    };
  }, [loadBookmarks]);

  async function removeBookmark(id: string) {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
      console.error("Delete failed:", error);
    } else {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      // Notify other tabs
      const bc = new BroadcastChannel("bookmark-sync");
      bc.postMessage("deleted");
      bc.close();
    }
  }

  if (loading) {
    return <p className="text-slate-400 text-sm">Loading your bookmarks…</p>;
  }

  if (bookmarks.length === 0) {
    return (
      <p className="text-slate-400 text-sm italic">
        No bookmarks yet. Add one above!
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {bookmarks.map((bm) => (
        <li
          key={bm.id}
          className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 group"
        >
          <div className="min-w-0 flex-1">
            <a
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline truncate block"
            >
              {bm.title}
            </a>
            <span className="text-xs text-slate-400 truncate block">
              {bm.url}
            </span>
          </div>
          <button
            onClick={() => removeBookmark(bm.id)}
            title="Delete bookmark"
            className="ml-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer text-lg"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}