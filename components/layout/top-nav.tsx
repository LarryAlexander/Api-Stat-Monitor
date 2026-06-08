"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase/client";

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const { auth } = await getFirebaseClient();
    await firebaseSignOut(auth);
    await fetch("/api/session/logout", { method: "POST" });
    router.push("/auth/login");
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="font-semibold text-zinc-900">
          PulseBoard
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/dashboard"
            className={`rounded-md px-2 py-1 ${pathname.startsWith("/dashboard") ? "bg-zinc-100" : "hover:bg-zinc-100"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/incidents"
            className={`rounded-md px-2 py-1 ${pathname.startsWith("/incidents") ? "bg-zinc-100" : "hover:bg-zinc-100"}`}
          >
            Incidents
          </Link>
          <button
            onClick={() => {
              void handleSignOut();
            }}
            className="rounded-md px-2 py-1 text-zinc-700 hover:bg-zinc-100"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
