'use server';

import Stripe from 'stripe';
import { redirect } from 'next/navigation';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function createCheckoutSession(orderId: string, price: number, serviceTitle: string) {
  
  // 1. Create a Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: serviceTitle,
            metadata: {
                orderId: orderId 
            }
          },
          unit_amount: Math.round(price * 100), // Stripe expects amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // 2. Redirection URLs
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}?payment=cancelled`,
    metadata: {
      orderId: orderId, // Crucial: This is what the Webhook reads to know which order to update
    },
  });

  // 3. Redirect user to the Stripe hosted page
  if (session.url) {
    redirect(session.url);
  }
}