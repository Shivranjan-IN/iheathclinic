import { ReceptionistDashboard } from "../../dashboards/ReceptionistDashboard";
import { User } from "../../common/types";

interface ReceptionDashboardProps {
  user: User;
}

// ROLE: Receptionist - Shows receptionist dashboard with appointment and check-in management
export function ReceptionDashboard({ user }: ReceptionDashboardProps) {
  return <ReceptionistDashboard user={user} />;
}
