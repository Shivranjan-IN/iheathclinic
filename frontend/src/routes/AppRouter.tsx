import React, { useEffect, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { toast } from 'sonner';

// Core Pages (Statically loaded for immediate paint)
import { Home } from "../public/Home";
import { LoginPage as Login } from "../auth/Login";
import { ForgotPassword } from "../auth/ForgotPassword";
import { ResetPassword } from "../auth/ResetPassword";

// Lazy-loaded Registration Components
const ClinicRegistration = React.lazy(() => import("../clinic/ClinicRegistration").then(m => ({ default: m.ClinicRegistration })));
const DoctorRegistration = React.lazy(() => import("../doctor/DoctorRegistration").then(m => ({ default: m.DoctorRegistration })));
const LabRegistration = React.lazy(() => import("../lab/LabRegistration").then(m => ({ default: m.LabRegistration })));
const PatientRegistration = React.lazy(() => import("../auth/PatientRegistration").then(m => ({ default: m.PatientRegistration })));

// Lazy-loaded Public Pages
const Features = React.lazy(() => import("../public/Features").then(m => ({ default: m.Features })));
const HowItWorks = React.lazy(() => import("../public/HowItWorks").then(m => ({ default: m.HowItWorks })));
const Pricing = React.lazy(() => import("../public/Pricing").then(m => ({ default: m.Pricing })));
const AIFeatures = React.lazy(() => import("../public/AIFeatures").then(m => ({ default: m.AIFeatures })));
const Healthcare = React.lazy(() => import("../public/Healthcare").then(m => ({ default: m.Healthcare })));
const Medicine = React.lazy(() => import("../public/MedicineEnhanced").then(m => ({ default: m.MedicineEnhanced })));
const DoctorConsult = React.lazy(() => import("../public/DoctorDirectory").then(m => ({ default: m.DoctorDirectory })));
const LabTests = React.lazy(() => import("../public/LabTests").then(m => ({ default: m.LabTests })));
const Plus = React.lazy(() => import("../public/Plus").then(m => ({ default: m.Plus })));
const HealthInsights = React.lazy(() => import("../public/HealthInsights").then(m => ({ default: m.HealthInsights })));
const Offers = React.lazy(() => import("../public/Offers").then(m => ({ default: m.Offers })));
const Contact = React.lazy(() => import("../public/Contact").then(m => ({ default: m.Contact })));
const CartPage = React.lazy(() => import("../patient/CartPage").then(m => ({ default: m.CartPage })));

// Lazy-loaded Patient Secured Portal Components
const PatientPortal = React.lazy(() => import("../patient/PatientPortal").then(m => ({ default: m.PatientPortal })));
const BookAppointment = React.lazy(() => import("../patient/BookAppointment").then(m => ({ default: m.BookAppointment })));
const MyAppointments = React.lazy(() => import("../patient/MyAppointments").then(m => ({ default: m.MyAppointments })));
const MyPrescriptions = React.lazy(() => import("../patient/MyPrescriptions").then(m => ({ default: m.MyPrescriptions })));
const MyReports = React.lazy(() => import("../patient/MyReports").then(m => ({ default: m.MyReports })));
const MyBilling = React.lazy(() => import("../patient/MyBilling").then(m => ({ default: m.MyBilling })));
const PatientProfile = React.lazy(() => import("../patient/PatientProfile").then(m => ({ default: m.PatientProfile })));
const MedicineStore = React.lazy(() => import("../patient/MedicineStore").then(m => ({ default: m.MedicineStore })));
const VideoConsultation = React.lazy(() => import("../patient/VideoConsultation").then(m => ({ default: m.VideoConsultation })));
const AIHealthTools = React.lazy(() => import("../patient/AIHealthTools").then(m => ({ default: m.AIHealthTools })));
const XrayAnalysisPage = React.lazy(() => import("../patient/XrayAnalysisPage").then(m => ({ default: m.XrayAnalysisPage })));

// Lazy-loaded Dashboards
const DoctorDashboard = React.lazy(() => import("../doctor/DoctorDashboard").then(m => ({ default: m.DoctorDashboard })));
const ClinicDashboard = React.lazy(() => import("../clinic/ClinicDashboard").then(m => ({ default: m.ClinicDashboard })));
const ReceptionDashboard = React.lazy(() => import("../staff/reception/ReceptionDashboard").then(m => ({ default: m.ReceptionDashboard })));
const NurseDashboard = React.lazy(() => import("../staff/nurse/NurseDashboard").then(m => ({ default: m.NurseDashboard })));
const LabDashboard = React.lazy(() => import("../lab/LabDashboard").then(m => ({ default: m.LabDashboard })));
const PharmacyDashboard = React.lazy(() => import("../staff/pharmacy/PharmacyDashboard").then(m => ({ default: m.PharmacyDashboard })));
const AdminDashboard = React.lazy(() => import("../admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));

// Lazy-loaded Clinic Management Views
const ClinicProfile = React.lazy(() => import("../clinic/ClinicProfile").then(m => ({ default: m.ClinicProfile })));
const AppointmentManagement = React.lazy(() => import("../clinic/AppointmentManagement").then(m => ({ default: m.AppointmentManagement })));
const PatientManagement = React.lazy(() => import("../clinic/PatientManagement").then(m => ({ default: m.PatientManagement })));
const StaffManagement = React.lazy(() => import("../staff/StaffManagement").then(m => ({ default: m.StaffManagement })));
const BillingPayments = React.lazy(() => import("../clinic/BillingPayments").then(m => ({ default: m.BillingPayments })));
const PharmacyInventory = React.lazy(() => import("../clinic/PharmacyInventory").then(m => ({ default: m.PharmacyInventory })));
const LabDiagnostics = React.lazy(() => import("../clinic/LabDiagnostics").then(m => ({ default: m.LabDiagnostics })));
const PrescriptionRecords = React.lazy(() => import("../clinic/PrescriptionRecords").then(m => ({ default: m.PrescriptionRecords })));
const QueueManagement = React.lazy(() => import("../clinic/QueueManagement").then(m => ({ default: m.QueueManagement })));
const ReportsAnalytics = React.lazy(() => import("../clinic/ReportsAnalytics").then(m => ({ default: m.ReportsAnalytics })));
const IoTIntegration = React.lazy(() => import("../clinic/IoTIntegration").then(m => ({ default: m.IoTIntegration })));
const Settings = React.lazy(() => import("../clinic/Settings").then(m => ({ default: m.Settings })));
const Notifications = React.lazy(() => import("../clinic/Notifications").then(m => ({ default: m.Notifications })));

// Premium loading skeleton for lazy fallback
const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-500 font-medium text-sm">Loading dynamic components...</p>
    </div>
);

export const AppRouter: React.FC = () => {
    const { user, login, logout, loading } = useAuth();
    const { currentView, navigateTo } = useNavigation();

    // Security Route Guard: Intercept unauthorized view access
    useEffect(() => {
        if (loading) return;

        const role = user?.role?.toLowerCase();
        
        // Define role requirements for secure routes
        const isPatientView = currentView.startsWith("patient-") || currentView === "patient-dashboard";
        const isClinicView = currentView.startsWith("clinic-") || currentView === "clinic-dashboard";
        const isDoctorView = currentView.startsWith("doctor-") || currentView === "doctor-dashboard";
        
        const isStaffView = [
            "reception-dashboard", 
            "nurse-dashboard", 
            "lab-dashboard", 
            "pharmacy-dashboard", 
            "admin-dashboard"
        ].includes(currentView);

        if (isPatientView || isClinicView || isDoctorView || isStaffView || currentView === "dashboard") {
            // Unauthenticated redirect to login
            if (!user) {
                toast.error("Please login to access this section");
                navigateTo("login");
                return;
            }

            // Role-based authorization check
            if (isPatientView && role !== "patient") {
                toast.error("Unauthorized: You do not have patient credentials");
                navigateTo("dashboard");
            } else if (isClinicView && role !== "clinic" && role !== "admin") {
                toast.error("Unauthorized: Access restricted to clinic administrators");
                navigateTo("dashboard");
            } else if (isDoctorView && role !== "doctor") {
                toast.error("Unauthorized: Access restricted to verified doctors");
                navigateTo("dashboard");
            } else if (currentView === "reception-dashboard" && role !== "receptionist" && role !== "admin" && role !== "clinic") {
                toast.error("Unauthorized access");
                navigateTo("dashboard");
            } else if (currentView === "nurse-dashboard" && role !== "nurse") {
                toast.error("Unauthorized access");
                navigateTo("dashboard");
            } else if (currentView === "lab-dashboard" && role !== "lab") {
                toast.error("Unauthorized access");
                navigateTo("dashboard");
            } else if (currentView === "pharmacy-dashboard" && role !== "pharmacy") {
                toast.error("Unauthorized access");
                navigateTo("dashboard");
            } else if (currentView === "admin-dashboard" && role !== "admin") {
                toast.error("Unauthorized access");
                navigateTo("dashboard");
            }
        }
    }, [currentView, user, loading, navigateTo]);

    // Update dynamic page title in format: "Page Name | I Health Clinic"
    useEffect(() => {
        const viewTitles: Record<string, string> = {
            home: "Home",
            login: "Login",
            "forgot-password": "Forgot Password",
            "reset-password": "Reset Password",
            "register-clinic": "Clinic Registration",
            "register-doctor": "Doctor Registration",
            "register-lab": "Lab Registration",
            "register-patient": "Patient Registration",
            features: "Features",
            "how-it-works": "How It Works",
            pricing: "Pricing",
            "ai-features": "AI Health Suite",
            medicine: "Pharmacy",
            healthcare: "Healthcare Solutions",
            "doctor-consult": "Doctor Consultations",
            "lab-tests": "Lab Diagnostics",
            plus: "Plus Benefits",
            "health-insights": "Health Insights",
            offers: "Special Offers",
            contact: "Contact Us",
            cart: "Shopping Cart",
            "patient-book-appointment": "Book Appointment",
            "patient-appointments": "My Appointments",
            "patient-prescriptions": "My Prescriptions",
            "patient-reports": "My Health Reports",
            "patient-billing": "My Invoices",
            "patient-profile": "My Profile",
            "patient-medicine-store": "Pharmacy Store",
            "patient-video-consult": "Telemedicine",
            "patient-ai-tools": "AI Medical Intelligence Suite",
            "patient-xray-analysis": "AI Chest X-Ray Analyzer",
            "clinic-appointments": "Appointments Management",
            "clinic-doctors": "Doctors Directory",
            "clinic-patients": "Patients Records",
            "clinic-staff": "Staff Roster",
            "clinic-billing": "Invoicing & Revenue",
            "clinic-pharmacy": "Pharmacy Inventory",
            "clinic-lab": "Lab Orders",
            "clinic-prescriptions": "Prescription Analytics",
            "clinic-queue": "Patient Flow Management",
            "clinic-reports": "Operations Analytics",
            "clinic-iot": "Smart Device Sync",
            "clinic-settings": "Clinic Control Panel",
            "clinic-notifications": "Announcements",
            "clinic-profile": "Clinic Public Profile",
            dashboard: "Dashboard",
            "patient-dashboard": "Patient Portal",
            "doctor-dashboard": "Doctor Portal",
            "clinic-dashboard": "Clinic Portal",
            "reception-dashboard": "Reception Desk",
            "nurse-dashboard": "Nursing Station",
            "lab-dashboard": "Diagnostics Lab",
            "pharmacy-dashboard": "Pharmacy Desk",
            "admin-dashboard": "System Administration",
        };

        const pageName = viewTitles[currentView] || "Welcome";
        document.title = `${pageName} | I Health Clinic`;
    }, [currentView]);

    // Auto-redirect authenticated users from home to dashboard
    useEffect(() => {
        if (!loading && user && currentView === "home") {
            navigateTo("dashboard");
        }
    }, [user, loading, currentView, navigateTo]);

    const handleLoginRequired = () => {
        alert("Please login to continue");
        navigateTo("login");
    };

    const handleRegister = (role: "doctor" | "clinic" | "lab" | "patient") => {
        if (role === "clinic") {
            navigateTo("register-clinic");
        } else if (role === "doctor") {
            navigateTo("register-doctor");
        } else if (role === "lab") {
            navigateTo("register-lab");
        } else if (role === "patient") {
            navigateTo("register-patient");
        }
    };

    const handleRegistrationComplete = () => {
        alert("Registration completed successfully! Welcome to your dashboard.");
        navigateTo("dashboard");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-500 font-medium">Initializing I Health Clinic...</p>
            </div>
        );
    }

    const isPatientView = currentView.startsWith("patient-") || currentView === "patient-dashboard";
    const isClinicView = currentView.startsWith("clinic-") || currentView === "clinic-dashboard";
    const isDoctorView = currentView.startsWith("doctor-") || currentView === "doctor-dashboard";
    const isStaffView = [
        "reception-dashboard", 
        "nurse-dashboard", 
        "lab-dashboard", 
        "pharmacy-dashboard", 
        "admin-dashboard"
    ].includes(currentView);

    // If it's a secure view but the user state is invalid, show loading fallback while redirect takes place
    if ((isPatientView || isClinicView || isDoctorView || isStaffView || currentView === "dashboard") && !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-500 font-medium">Authorizing access parameters...</p>
            </div>
        );
    }

    // Render helper for routing inside Suspense
    const renderView = () => {
        // Public Authentication & Registration
        if (currentView === "login") return <Login onLogin={login} onBack={() => navigateTo("home")} onRegister={handleRegister} />;
        if (currentView === "forgot-password") return <ForgotPassword />;
        if (currentView === "reset-password") return <ResetPassword />;
        if (currentView === "register-clinic") return <ClinicRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("login")} />;
        if (currentView === "register-doctor") return <DoctorRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("login")} />;
        if (currentView === "register-lab") return <LabRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("login")} />;
        if (currentView === "register-patient") return <PatientRegistration onSuccess={handleRegistrationComplete} onBack={() => navigateTo("home")} onLogin={() => navigateTo("login")} />;

        // Public Feature Pages
        if (currentView === "features") return <Features onNavigate={navigateTo} />;
        if (currentView === "how-it-works") return <HowItWorks onNavigate={navigateTo} />;
        if (currentView === "pricing") return <Pricing onNavigate={navigateTo} />;
        if (currentView === "ai-features") return <AIFeatures onNavigate={navigateTo} />;
        if (currentView === "medicine") return <Medicine onNavigate={navigateTo} user={user} onLoginRequired={handleLoginRequired} />;
        if (currentView === "healthcare") return <Healthcare onNavigate={navigateTo} />;
        if (currentView === "doctor-consult") return <DoctorConsult onNavigate={navigateTo} user={user} onLoginRequired={handleLoginRequired} onBookAppointment={() => navigateTo("patient-book-appointment")} />;
        if (currentView === "lab-tests") return <LabTests onNavigate={navigateTo} />;
        if (currentView === "plus") return <Plus onNavigate={navigateTo} />;
        if (currentView === "health-insights") return <HealthInsights onNavigate={navigateTo} />;
        if (currentView === "offers") return <Offers onNavigate={navigateTo} />;
        if (currentView === "contact") return <Contact onNavigate={navigateTo} />;
        if (currentView === "cart") return <CartPage patient={user as any} onNavigate={navigateTo} />;

        // Patient Secured Views
        if (currentView === "patient-book-appointment") return <BookAppointment patient={user as any} />;
        if (currentView === "patient-appointments") return <MyAppointments patient={user as any} onNavigate={navigateTo as any} />;
        if (currentView === "patient-prescriptions") return <MyPrescriptions patient={user as any} />;
        if (currentView === "patient-reports") return <MyReports patient={user as any} />;
        if (currentView === "patient-billing") return <MyBilling patient={user as any} />;
        if (currentView === "patient-profile") return <PatientProfile patient={user as any} onProfileUpdate={() => {}} />;
        if (currentView === "patient-medicine-store") return <MedicineStore onNavigate={navigateTo as any} />;
        if (currentView === "patient-video-consult") return <VideoConsultation patient={user as any} />;
        if (currentView === "patient-ai-tools") return <AIHealthTools />;
        if (currentView === "patient-xray-analysis") return <XrayAnalysisPage user={user as any} onBack={() => navigateTo("dashboard")} />;

        // Clinic Management Views
        if (currentView === "clinic-appointments") return <AppointmentManagement userRole={user?.role as any} />;
        if (currentView === "clinic-doctors") return <DoctorRegistration onBack={() => navigateTo("dashboard")} />;
        if (currentView === "clinic-patients") return <PatientManagement user={user} onBack={() => navigateTo("dashboard")} />;
        if (currentView === "clinic-staff") return <StaffManagement user={user} onBack={() => navigateTo("dashboard")} />;
        if (currentView === "clinic-billing") return <BillingPayments userRole={user?.role as any} />;
        if (currentView === "clinic-pharmacy") return <PharmacyInventory userRole={user?.role as any} />;
        if (currentView === "clinic-lab") return <LabDiagnostics user={user} onBack={() => navigateTo("dashboard")} />;
        if (currentView === "clinic-prescriptions") return <PrescriptionRecords userRole={user?.role as any} />;
        if (currentView === "clinic-queue") return <QueueManagement userRole={user?.role as any} />;
        if (currentView === "clinic-reports") return <ReportsAnalytics userRole={user?.role as any} />;
        if (currentView === "clinic-iot") return <IoTIntegration userRole={user?.role as any} />;
        if (currentView === "clinic-settings") return <Settings userRole={user?.role as any} />;
        if (currentView === "clinic-notifications") return <Notifications userRole={user?.role as any} />;
        if (currentView === "clinic-profile") return <ClinicProfile user={user} onBack={() => navigateTo("dashboard")} />;

        // Main Role Dashboards (explicitly requested dashboards)
        if (currentView === "patient-dashboard" && user) return <PatientPortal user={user} onLogout={logout} />;
        if (currentView === "doctor-dashboard" && user) return <DoctorDashboard user={user} />;
        if (currentView === "clinic-dashboard" && user) return <ClinicDashboard user={user} />;
        if (currentView === "reception-dashboard" && user) return <ReceptionDashboard user={user} />;
        if (currentView === "nurse-dashboard" && user) return <NurseDashboard user={user} />;
        if (currentView === "lab-dashboard" && user) return <LabDashboard user={user} />;
        if (currentView === "pharmacy-dashboard" && user) return <PharmacyDashboard user={user} />;
        if (currentView === "admin-dashboard" && user) return <AdminDashboard user={user} />;

        // Role-based Routing (Generic "dashboard" view)
        if (currentView === "dashboard" && user) {
            const role = user.role?.toLowerCase();
            switch (role) {
                case "patient": return <PatientPortal user={user} onLogout={logout} />;
                case "doctor": return <DoctorDashboard user={user} />;
                case "clinic": return <ClinicDashboard user={user} />;
                case "receptionist": return <ReceptionDashboard user={user} />;
                case "nurse": return <NurseDashboard user={user} />;
                case "lab": return <LabDashboard user={user} />;
                case "pharmacy": return <PharmacyDashboard user={user} />;
                case "admin": return <AdminDashboard user={user} />;
                default:
                    return (
                        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-center">
                            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                                <h1 className="text-2xl font-black text-red-600 mb-2 uppercase">Access Restricted</h1>
                                <p className="text-slate-500 mb-6">Your account role ({user?.role}) is not recognized. Please contact the administrator.</p>
                                <button 
                                    onClick={() => navigateTo("home")} 
                                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Return to Homepage
                                </button>
                            </div>
                        </div>
                    );
            }
        }

        // Default Fallback (usually Homepage)
        return <Home onGetStarted={() => navigateTo("login")} onNavigate={navigateTo} />;
    };

    return (
        <Suspense fallback={<PageLoader />}>
            {renderView()}
        </Suspense>
    );
};
