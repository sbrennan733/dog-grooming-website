import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to manage your dogs and bookings.",
};

export default function LoginPage() {
  return (
    <div className="bg-white px-6 py-20">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
          Log In
        </h1>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
