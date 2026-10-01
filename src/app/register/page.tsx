import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a customer account to manage your dogs and bookings.",
};

export default function RegisterPage() {
  return (
    <div className="bg-white px-6 py-20">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
          Create Account
        </h1>

        <RegisterForm />
      </div>
    </div>
  );
}
