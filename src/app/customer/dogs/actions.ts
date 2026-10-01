"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dogSchema, type DogFormState } from "@/lib/validations/dog";

export async function createDog(
  _prevState: DogFormState,
  formData: FormData
): Promise<DogFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const validatedFields = dogSchema.safeParse({
    name: formData.get("name"),
    breed: formData.get("breed"),
    age: formData.get("age"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  await prisma.dog.create({
    data: {
      ...validatedFields.data,
      ownerId: session.user.id,
    },
  });

  redirect("/customer");
}

export async function updateDog(
  dogId: string,
  _prevState: DogFormState,
  formData: FormData
): Promise<DogFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const existingDog = await prisma.dog.findUnique({ where: { id: dogId } });
  if (!existingDog || existingDog.ownerId !== session.user.id) {
    redirect("/customer");
  }

  const validatedFields = dogSchema.safeParse({
    name: formData.get("name"),
    breed: formData.get("breed"),
    age: formData.get("age"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  await prisma.dog.update({
    where: { id: dogId },
    data: validatedFields.data,
  });

  redirect("/customer");
}
