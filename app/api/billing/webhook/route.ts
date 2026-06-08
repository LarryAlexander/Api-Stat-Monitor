import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { adminDb } = await import("@/lib/firebase/admin");

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const snapshot = await adminDb
          .collection("workspaces")
          .where("stripe_customer_id", "==", customerId)
          .limit(1)
          .get();

        const workspaceDoc = snapshot.docs[0];
        if (workspaceDoc) {
          await workspaceDoc.ref.update({
            subscription_status: subscription.status,
            subscription_id: subscription.id,
          });
          console.log(`Updated subscription for workspace: ${workspaceDoc.id} status: ${subscription.status}`);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const snapshot = await adminDb
          .collection("workspaces")
          .where("stripe_customer_id", "==", customerId)
          .limit(1)
          .get();

        const workspaceDoc = snapshot.docs[0];
        if (workspaceDoc) {
          await workspaceDoc.ref.update({
            subscription_status: "canceled",
            subscription_id: null,
          });
          console.log(`Canceled subscription for workspace: ${workspaceDoc.id}`);
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
