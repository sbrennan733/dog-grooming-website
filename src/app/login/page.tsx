import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Customer login is coming soon.",
};

export default function LoginPage() {
  return (
    <div className="bg-white px-6 py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Login Coming Soon
      </h1>

      <p className="text-lg text-gray-600">
        Customer accounts are under construction.
      </p>
    </div>
  );
}
