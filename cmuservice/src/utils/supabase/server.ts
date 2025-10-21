// src/utils/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'; // Import the specific type if needed

export const createClient = async () => {
  // Explicitly type cookieStore
  const cookieStore: ReadonlyRequestCookies = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Ensure the return type matches what Supabase expects
        get(name: string): string | undefined {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // This action is intentionally placed in a try/catch block.
            // Server Components cannot set cookies directly.
            // The `createServerClient` function correctly handles this by
            // passing the cookie operations to the appropriate context (like Server Actions or Route Handlers)
            // where setting cookies is allowed. Casting to 'any' might be needed to satisfy TS here.
             // Use a more specific type assertion or refactor to avoid 'any'
             (cookieStore as unknown as { set: (name: string, value: string, options: CookieOptions) => void }).set(name, value, options)
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // Log the error for debugging if needed, but it's expected in Server Components
            // console.warn('Failed to set cookie in Server Component:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Similar to `set`, this is handled correctly by createServerClient
            // despite the read-only nature of cookieStore in this context.
             (cookieStore as unknown as { set: (name: string, value: string, options: CookieOptions) => void }).set(name, '', options) // Use set with empty value for removal
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // Log the error for debugging if needed
            // console.warn('Failed to remove cookie in Server Component:', error);
          }
        },
      },
    }
  )
}