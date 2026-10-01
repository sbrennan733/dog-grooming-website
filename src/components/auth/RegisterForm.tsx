"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { registerUser } from "@/app/register/actions";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerUser,
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormField
        label="Name"
        name="name"
        type="text"
        required
        autoComplete="name"
        errors={state?.errors?.name}
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        errors={state?.errors?.email}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        errors={state?.errors?.password}
      />

      <FormField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
        errors={state?.errors?.confirmPassword}
      />

      {state?.message && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
