import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { PatientDashboard } from './PatientDashboard';
import { AIHealthTools } from './AIHealthTools';
import { MedicineStore } from './MedicineStore';
import { PatientProfile } from './PatientProfile';
import { BookAppointment } from './BookAppointment';
import { MyPrescriptions } from './MyPrescriptions';
import { MyBilling } from './MyBilling';
import { CartPage } from './CartPage';
import { OrderHistory } from './OrderHistory';
import { MedicineReminders } from './MedicineReminders';
import { PatientHeader } from './PatientHeader';
import { PatientSidebar } from './PatientSidebar';
import { MyAppointments } from './MyAppointments';
import { VideoConsultation } from './VideoConsultation';
import { MyReports } from './MyReports';
import { PatientChatbot } from './PatientChatbot';
import type { User } from '../common/types';

export type PatientPage =
  | 'dashboard'
  | 'ai-tools'
  | 'medicine-store'
  | 'profile'
  | 'book-appointment'
  | 'appointments'
  | 'video-consultation'
  | 'prescriptions'
  | 'reports'
  | 'cart'
  | 'orders'
  | 'reminders'
  | 'billing';

export interface PatientUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  abhaId?: string;
  age?: number;
  bloodGroup?: string;
  address?: string;
  gender?: string;
  insuranceId?: string;
  dob?: string | Date;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  prescriptions?: any[];
  emergencyContact?: string;
}

interface PatientPortalProps {
  user: User;
  onLogout?: () => void;
}

export function PatientPortal({ user, onLogout }: PatientPortalProps) {
  const [currentPage, setCurrentPage] = useState<PatientPage>('dashboard');
  const [patientData, setPatientData] = useState<PatientUser>({
    id: user.id || '',
    name: user.name || '',
    email: user.email || '',
    avatar: user.avatar || '',
    phone: '',
    abhaId: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        setLoading(true);
        const fullPatient = await patientService.getPatientProfile();

        if (fullPatient) {
          setPatientData({
            id: fullPatient.patient_id,
            name: fullPatient.full_name,
            email: fullPatient.email || user.email || '',
            phone: fullPatient.phone,
            avatar: fullPatient.profile_photo_url || user.avatar || '',
            abhaId: fullPatient.abha_id,
            age: fullPatient.age,
            bloodGroup: fullPatient.blood_group,
            address: fullPatient.address,
            gender: fullPatient.gender,
            insuranceId: fullPatient.insurance_id,
            dob: fullPatient.date_of_birth,
            allergies: fullPatient.allergies || [],
            chronicDiseases: fullPatient.chronicDiseases || [],
            currentMedications: fullPatient.currentMedications || [],
            prescriptions: fullPatient.prescriptions || [],
            emergencyContact: fullPatient.emergency_contact || ''
          });
        }
      } catch (error) {
        console.error('Error fetching full patient profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProfile();
  }, [user.email, user.avatar]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600 animate-pulse">Syncing your health profile...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PatientDashboard patient={patientData} onNavigate={setCurrentPage} />;
      case 'ai-tools':
        return <AIHealthTools />;
      case 'medicine-store':
        return <MedicineStore onNavigate={setCurrentPage} />;
      case 'profile':
        return <PatientProfile
          patient={patientData}
          onProfileUpdate={(updatedPatient) => setPatientData(updatedPatient)}
        />;
      case 'book-appointment':
        return <BookAppointment patient={patientData} />;
      case 'appointments':
        return <MyAppointments patient={patientData} onNavigate={setCurrentPage} />;
      case 'video-consultation':
        return <VideoConsultation patient={patientData} />;
      case 'prescriptions':
        return <MyPrescriptions patient={patientData} />;
      case 'reports':
        return <MyReports patient={patientData} />;
      case 'cart':
        return <CartPage patient={patientData} onNavigate={setCurrentPage} />;
      case 'orders':
        return <OrderHistory patient={patientData} />;
      case 'reminders':
        return <MedicineReminders patient={patientData} />;
      case 'billing':
        return <MyBilling patient={patientData} />;
      default:
        return <PatientDashboard patient={patientData} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
        <PatientSidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <PatientHeader patient={patientData} onLogout={onLogout} />
          <main className="flex-1 overflow-y-auto">
            {renderPage()}
          </main>
        </div>
      </div>
      {/* Floating MedBot widget — always present on every patient page */}
      <PatientChatbot />
    </>
  );
}
