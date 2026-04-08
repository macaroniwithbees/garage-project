import { requireRole } from "@/lib/requireRole";
import { ROLES } from "@/lib/roles";
import ClientsClient from "./ClientsClient";

export default async function ClientsPage() {
  await requireRole([ROLES.KLANT]);

  return <ClientsClient />;
}