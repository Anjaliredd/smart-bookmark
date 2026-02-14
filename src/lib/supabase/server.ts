import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const jar = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (newCookies) => {
          try {
            for (const c of newCookies) {
              jar.set(c.name, c.value, c.options);
            }
          } catch {
            // Ignored when called from Server Components
          }
        },
      },
    }
  );
}