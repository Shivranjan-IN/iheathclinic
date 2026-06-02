import { NurseDashboard as NurseDashboardContent } from "../../dashboards/NurseDashboard";
import { User } from "../../common/types";

interface NurseDashboardProps {
  user: User;
}

// ROLE: Nurse - Shows nurse dashboard with patient care and vital monitoring
export function NurseDashboard({ user }: NurseDashboardProps) {
  return <NurseDashboardContent user={user} />;
}
