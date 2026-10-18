import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Server Actions are reachable as plain POST endpoints, so each one must
// verify the caller itself rather than relying on the page it's rendered
// on being protected by the Proxy.
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/login");
  }
  return user;
}
