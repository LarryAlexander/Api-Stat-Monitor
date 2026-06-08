import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ensureWorkspace } from "@/lib/firebase/data";
import { requireUserSession } from "@/lib/firebase/session";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  try {
    const session = await requireUserSession();
    const workspace = await ensureWorkspace(session.uid);
    const origin = request.headers.get("origin") || "http://localhost:3000";

    let customerId = workspace.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.email || undefined,
        metadata: {
          workspaceId: workspace.id,
        },
      });
      customerId = customer.id;

      const { adminDb } = await import("@/lib/firebase/admin");
      await adminDb.collection("workspaces").doc(workspace.id).update({
        stripe_customer_id: customerId,
      });
    }

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Stripe Pro Price ID not configured" }, { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard`,
      cancel_url: `${origin}/dashboard/billing`,
      metadata: {
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Unable to create Stripe session" }, { status: 500 });
  }
}
