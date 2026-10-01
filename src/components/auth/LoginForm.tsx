"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { authenticate } from "@/app/login/actions";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [errorMessage, formAction, pending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={callbackUrl} />

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
