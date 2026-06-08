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

    const customerId = workspace.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json({ error: "Customer does not have a Stripe account yet." }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ error: "Unable to create Stripe portal session" }, { status: 500 });
  }
}
