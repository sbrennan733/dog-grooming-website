"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmailSafely } from "@/lib/email-verification";
import { registerSchema, type RegisterFormState } from "@/lib/validations/auth";

export async function registerUser(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      errors: { email: ["An account with this email already exists."] },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // A mail problem must not block sign-up; the check-email page tells the
  // user and they can request another email once logged in.
  const sent = await sendVerificationEmailSafely({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  redirect(sent ? "/register/check-email" : "/register/check-email?sent=false");
}
