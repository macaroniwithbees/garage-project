import { requireRole } from "@/lib/requireRole";
import { ROLES } from "@/lib/roles";
import ReceptionistDashboard from "@/components/DashboardReceptionist/ReceptionistDashboard";

export default async function ReceptionistPage() {
  await requireRole([ROLES.RECEPTIONIST]);

  return <ReceptionistDashboard />;
}