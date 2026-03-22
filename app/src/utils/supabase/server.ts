import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type MutableCookieStore = {
  set: (name: string, value: string, options: CookieOptions) => void;
};

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            const mutableCookieStore = cookieStore as unknown as MutableCookieStore;
            for (const { name, value, options } of cookiesToSet) {
              mutableCookieStore.set(name, value, options);
            }
          } catch {
            // Server Components may not be allowed to mutate cookies.
          }
        },
      },
    }
  );
};
