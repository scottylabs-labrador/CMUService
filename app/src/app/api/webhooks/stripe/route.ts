import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  // 1. Verify the event actually came from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook Signature Verification Failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // 2. Handle the specific event "checkout.session.completed"
  if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Retrieve the Order ID we attached in the Server Action
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        return new NextResponse("Metadata missing: No orderId found", { status: 400 });
      }

      console.log(`💰 Webhook received! Payment valid for Order: ${orderId}`);

      // 3. Update Supabase using SERVICE ROLE (Bypasses RLS policies)
      // Note: We create a fresh admin client here, distinct from the user client
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Update order status to completed
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order in Supabase:", updateError);
        return new NextResponse("Database update failed", { status: 500 });
      }

      // Optional: Add a notification for the buyer that payment is confirmed
      await supabaseAdmin.from("notifications").insert({
        recipient_id: session.metadata?.buyer_id, // Ensure you pass buyer_id in metadata in stripe.ts if you want this, otherwise skip
        order_id: orderId,
        notification_type: "order_completed",
        content: "Payment confirmed via Stripe. Your order is complete!",
      });

      return new NextResponse("Order updated", { status: 200 });
  }

  // Return 200 for other event types so Stripe doesn't keep retrying
  return new NextResponse(null, { status: 200 });
}