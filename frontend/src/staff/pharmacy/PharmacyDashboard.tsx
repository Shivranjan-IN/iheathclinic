import { PharmacyDashboard as PharmacyDashboardContent } from "../../dashboards/PharmacyDashboard";
import { User } from "../../common/types";

interface PharmacyDashboardProps {
  user: User;
}

// ROLE: Pharmacist - Shows pharmacy dashboard with inventory and prescription management
export function PharmacyDashboard({ user }: PharmacyDashboardProps) {
  return <PharmacyDashboardContent user={user} />;
}
