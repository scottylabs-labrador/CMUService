// supabase/functions/accept-offer/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { offer_id } = await req.json();
    if (!offer_id) {
      throw new Error("Offer ID is required.");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    // Fetch the offer and its related request
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*, requests(*)')
      .eq('id', offer_id)
      .single();

    if (offerError || !offer) throw new Error("Offer not found.");

    // Security check: only the requester can accept an offer
    if (offer.requests.user_id !== user.id) {
      throw new Error("You are not authorized to accept this offer.");
    }

    // --- This is the database transaction ---
    // 1. Create the new order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        request_id: offer.request_id, // Link to the original request
        buyer_id: offer.requests.user_id,
        seller_id: offer.provider_id,
        amount: offer.offer_price,
        status: 'awaiting_requirements'
      })
      .select('id')
      .single();

    if (orderError || !newOrder) throw new Error("Failed to create order.");

    // 2. Update the accepted offer's status
    await supabase.from('offers').update({ status: 'accepted' }).eq('id', offer_id);

    // 3. Reject all other offers for this request
    await supabase.from('offers').update({ status: 'rejected' }).eq('request_id', offer.request_id).not('id', 'eq', offer_id);

    // 4. Close the original request
    await supabase.from('requests').update({ status: 'closed' }).eq('id', offer.request_id);

    return new Response(JSON.stringify({ new_order_id: newOrder.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});