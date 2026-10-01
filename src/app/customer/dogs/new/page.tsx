import type { Metadata } from "next";
import DogForm from "@/components/dogs/DogForm";
import { createDog } from "@/app/customer/dogs/actions";

export const metadata: Metadata = {
  title: "Add a Dog",
  robots: { index: false, follow: false },
};

export default function NewDogPage() {
  return (
    <div className="bg-white px-6 py-20">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
          Add a Dog
        </h1>

        <DogForm action={createDog} submitLabel="Add Dog" />
      </div>
    </div>
  );
}
