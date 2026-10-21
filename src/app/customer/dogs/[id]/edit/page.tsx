import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DogForm from "@/components/dogs/DogForm";
import { updateDog } from "@/app/customer/dogs/actions";

export const metadata: Metadata = {
  title: "Edit Dog",
  robots: { index: false, follow: false },
};

interface EditDogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDogPage({ params }: EditDogPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const dog = await prisma.dog.findUnique({ where: { id } });

  if (!dog || dog.ownerId !== session.user.id) {
    notFound();
  }

  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-4xl text-ink">
          Edit {dog.name}
        </h1>

        <div className="rounded-3xl bg-surface p-8 shadow-soft">
          <DogForm
            action={updateDog.bind(null, dog.id)}
            defaultValues={{
              name: dog.name,
              breed: dog.breed,
              age: dog.age,
              size: dog.size,
              hasLongDoubleCoat: dog.hasLongDoubleCoat,
              notes: dog.notes,
            }}
            submitLabel="Save Changes"
          />
        </div>
      </div>
    </div>
  );
}
