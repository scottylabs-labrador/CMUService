import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  // Verify the webhook signature
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let event: {
    type: string;
    data: {
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      image_url?: string | null;
      email_addresses?: { email_address: string; id: string }[];
      primary_email_address_id?: string | null;
    };
  };

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, first_name, last_name, image_url } = event.data;

    const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.from("profiles").upsert(
      {
        id,
        full_name: fullName,
        avatar_url: image_url ?? null,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

    if (error) {
      console.error("Failed to create profile for new user:", error.message);
      return new NextResponse("Database error", { status: 500 });
    }

    console.log(`Profile created for new user: ${id}`);
  }

  return new NextResponse(null, { status: 200 });
}
