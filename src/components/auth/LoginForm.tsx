"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [errorMessage, setErrorMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorMessage(undefined);

    const formData = new FormData(event.currentTarget);

    // Signing in via the client-side `signIn` (rather than a Server
    // Action) matters here: only this path updates the SessionProvider's
    // cached session immediately, so the Navbar reflects the logged-in
    // state without needing a manual page reload.
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setErrorMessage("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />

      {errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging In..." : "Log In"}
      </Button>

      <p className="text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-gray-900 hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
