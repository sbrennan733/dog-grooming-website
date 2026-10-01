import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin dashboard is coming soon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <div className="bg-white px-6 py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Admin Dashboard Coming Soon
      </h1>

      <p className="text-lg text-gray-600">
        This area is under construction.
      </p>
    </div>
  );
}
