import { AdminDashboard } from "../admin/AdminDashboard";
import { User } from '../common/types';

interface ClinicDashboardProps {
  user: User;
}

// ROLE: Clinic - Shows comprehensive clinic management dashboard
// Uses the same AdminDashboard component as admin role
export function ClinicDashboard({ user }: ClinicDashboardProps) {
  return <AdminDashboard user={user} />;
}
