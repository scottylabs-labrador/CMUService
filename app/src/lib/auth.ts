import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const betterAuthUrl = getRequiredEnv("BETTER_AUTH_URL");
const databaseUrl = getRequiredEnv("DATABASE_URL");
const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseServiceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const authClientId = getRequiredEnv("AUTH_CLIENT_ID");
const authClientSecret = getRequiredEnv("AUTH_CLIENT_SECRET");
const authIssuer = getRequiredEnv("AUTH_ISSUER");

export const auth = betterAuth({
  baseURL: betterAuthUrl,
  database: new Pool({ connectionString: databaseUrl }),
  advanced: {
    database: {
      generateId: () => randomUUID(),
    },
  },

  // Sync new users to the Supabase profiles table on first login
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
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
    nextCookies(),
    genericOAuth({
      config: [
        {
          providerId: "keycloak",
          clientId: authClientId,
          clientSecret: authClientSecret,
          discoveryUrl: `${authIssuer}/.well-known/openid-configuration`,
          redirectURI: `${betterAuthUrl}/api/auth/oauth2/callback/keycloak`,
          scopes: ["openid", "email", "profile", "offline_access"],
        },
      ],
    }),
  ],
});
