import { requireRole } from "@/lib/requireRole";
import { ROLES } from "@/lib/roles";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  await requireRole([ROLES.ADMIN, ROLES.EIGENAAR]);

  return <AdminClient />;
}