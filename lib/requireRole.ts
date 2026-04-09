import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getProfile";

export async function requireRole(allowedRoles: string[]) {
  const profile = await getUserProfile();

  if (!profile) redirect("/login");

  if (!allowedRoles.includes(profile.role)) {
    redirect("/dashboard");
  }

  return profile;
}