import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionCookie, setSessionCookie } from "@/lib/firebase/session";

const loginSchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { idToken } = loginSchema.parse(await request.json());
    const sessionCookie = await createSessionCookie(idToken);
    await setSessionCookie(sessionCookie);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create session";
    return NextResponse.json({ message }, { status: 400 });
  }
}
