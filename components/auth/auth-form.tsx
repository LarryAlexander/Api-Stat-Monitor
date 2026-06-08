"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  getIdToken,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase/client";

interface AuthFormProps {
  redirectTo?: string;
}

export default function AuthForm({ redirectTo = "/dashboard" }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const nextPath = useMemo(() => redirectTo || "/dashboard", [redirectTo]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { auth } = await getFirebaseClient();

      if (isSignUp) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await getIdToken(credential.user);
        const response = await fetch("/api/session/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error("Unable to create session");
        }

        router.push(nextPath);
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await getIdToken(credential.user);
        const response = await fetch("/api/session/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error("Unable to create session");
        }

        router.push(nextPath);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900">PulseBoard</h1>
      <p className="mb-6 text-sm text-zinc-600">Sign in to monitor API uptime and response health.</p>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="dev@company.com"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="At least 6 characters"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Working..." : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-zinc-700">{message}</p>}
      <button
        type="button"
        className="mt-4 text-sm font-medium text-zinc-900 underline"
        onClick={() => setIsSignUp((value) => !value)}
      >
        {isSignUp ? "Already have an account? Sign in" : "Need an account? Create one"}
      </button>
    </div>
  );
}
