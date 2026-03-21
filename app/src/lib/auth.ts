import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  database: new Pool({ connectionString: process.env.DATABASE_URL! }),

  // Sync new users to the Supabase profiles table on first login
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              full_name: user.name ?? "",
              avatar_url: user.image ?? null,
            },
            { onConflict: "id", ignoreDuplicates: true }
          );
        },
      },
    },
  },

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "keycloak",
          clientId: process.env.AUTH_CLIENT_ID!,
          clientSecret: process.env.AUTH_CLIENT_SECRET!,
          discoveryUrl: `${process.env.AUTH_ISSUER}/.well-known/openid-configuration`,
          redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/oauth2/callback/keycloak`,
          scopes: ["openid", "email", "profile", "offline_access"],
        },
      ],
    }),
  ],
});
