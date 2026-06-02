export type UserRole = "patient" | "doctor" | "clinic" | "receptionist" | "nurse" | "lab" | "pharmacy" | "admin" | null;

export interface User {
    id: string;
    name?: string;
    full_name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    doctor_id?: number | string;
    clinic_id?: number | string;
    patient_id?: string;
}

export type PageView =
    // Core Pages
    | "home" | "login" | "dashboard" | "loading" | "forgot-password" | "reset-password"
    | "features" | "how-it-works" | "pricing" | "ai-features"
    | "medicine" | "cart" | "healthcare" | "doctor-consult"
    | "lab-tests" | "plus" | "health-insights" | "offers" | "contact"
    | "register-clinic" | "register-doctor" | "register-lab"
    // Patient Portal Views
    | "patient-book-appointment" | "patient-appointments"
    | "patient-prescriptions" | "patient-reports" | "patient-billing"
    | "patient-profile" | "patient-medicine-store" | "patient-video-consult"
    | "patient-ai-tools" | "patient-xray-analysis"
    // Clinic Management Views
    | "clinic-appointments" | "clinic-patients" | "clinic-doctors" | "clinic-register-doctor"
    | "clinic-staff" | "clinic-billing" | "clinic-pharmacy"
    | "clinic-lab" | "clinic-prescriptions" | "clinic-queue"
    | "clinic-reports" | "clinic-iot" | "clinic-ai"
    | "clinic-security" | "clinic-settings" | "clinic-notifications"
    | "clinic-profile"
    // Specific Role Dashboards (if needed separately)
    | "doctor-dashboard" | "reception-dashboard" | "nurse-dashboard"
    | "lab-dashboard" | "pharmacy-dashboard" | "patient-dashboard" | "clinic-dashboard" | "admin-dashboard";
