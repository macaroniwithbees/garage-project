import { requireRole } from "@/lib/requireRole";
import { ROLES } from "@/lib/roles";
import MonteurDashboard from "@/components/DashboardMonteur/MonteurDashboard";

export default async function MonteurPage() {
  await requireRole([ROLES.MONTEUR]);

  return <MonteurDashboard />;
}