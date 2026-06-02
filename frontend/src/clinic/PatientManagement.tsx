import { useState, useEffect } from 'react';
import { User } from '../common/types';
import { clinicService, SearchPatientResult, ClinicDoctor } from '../services/clinicService';
import { Toaster, toast } from 'sonner';
import {
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  UserPlus,
  Loader2,
  X,
  AlertCircle,
  CalendarPlus,
  User as UserIcon
} from 'lucide-react';

interface PatientManagementProps {
  user: User | null;
  onBack: () => void;
}

type TabId = 'search' | 'today' | 'upcoming' | 'completed';

export function PatientManagement({ user: _user, onBack }: PatientManagementProps) {
  const [activeTab, setActiveTab] = useState<TabId>('search');
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchPatientResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected patient for booking
  const [selectedPatient, setSelectedPatient] = useState<SearchPatientResult | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Booking form state
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [bookingForm, setBookingForm] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'consultation',
    reason: ''
  });
  const [isBooking, setIsBooking] = useState(false);

  // Create patient form state
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    blood_group: '',
    abha_id: '',
    address: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Patient detail view
  const [detailPatient, setDetailPatient] = useState<any | null>(null);

  useEffect(() => {
    if (activeTab !== 'search') {
      loadPatients();
    }
  }, [activeTab]);

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    try {
      const data = await clinicService.getClinicDoctorsList();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  }

  async function loadPatients() {
    try {
      setIsLoading(true);
      const tabMap: Record<string, 'today' | 'upcoming' | 'completed'> = {
        today: 'today',
        upcoming: 'upcoming',
        completed: 'completed'
      };
      const data = await clinicService.getPatients(tabMap[activeTab]);
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      toast.error('Please enter at least 3 characters to search');
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      const results = await clinicService.searchPatient(searchQuery.trim());
      setSearchResults(results);
      if (results.length === 0) {
        toast.info('No patient found. You can create a new patient.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  }

  function openBooking(patient: SearchPatientResult) {
    setSelectedPatient(patient);
    setBookingForm({
      doctor_id: doctors.length > 0 ? doctors[0].id.toString() : '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '10:00',
      type: 'consultation',
      reason: ''
    });
    setShowBookingModal(true);
  }

  async function handleBookAppointment() {
    if (!selectedPatient) return;
    if (!bookingForm.doctor_id || !bookingForm.appointment_date || !bookingForm.appointment_time) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsBooking(true);
      await clinicService.bookAppointment({
        patient_id: selectedPatient.patient_id,
        doctor_id: parseInt(bookingForm.doctor_id),
        appointment_date: bookingForm.appointment_date,
        appointment_time: bookingForm.appointment_time,
        type: bookingForm.type,
        reason: bookingForm.reason
      });
      toast.success(`Appointment booked for ${selectedPatient.full_name}!`);
      setShowBookingModal(false);
      setSelectedPatient(null);
      // Optionally refresh if on a tab
      if (activeTab !== 'search') loadPatients();
    } catch (error: any) {
      console.error('Booking failed:', error);
      toast.error(error?.message || 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  }

  function openCreateModal() {
    // Pre-fill email/phone from search query
    const q = searchQuery.trim();
    setCreateForm({
      full_name: '',
      email: q.includes('@') ? q : '',
      phone: /^\d+$/.test(q) ? q : '',
      gender: 'Male',
      date_of_birth: '',
      blood_group: '',
      abha_id: '',
      address: ''
    });
    setShowCreateModal(true);
  }

  async function handleCreatePatient() {
    if (!createForm.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!createForm.email.trim() && !createForm.phone.trim()) {
      toast.error('Either email or phone is required');
      return;
    }

    try {
      setIsCreating(true);
      const result = await clinicService.addNewPatient({
        full_name: createForm.full_name.trim(),
        email: createForm.email.trim() || undefined,
        phone: createForm.phone.trim() || undefined,
        gender: createForm.gender,
        date_of_birth: createForm.date_of_birth || undefined,
        blood_group: createForm.blood_group || undefined,
        abha_id: createForm.abha_id || undefined,
        address: createForm.address || undefined
      });

      if (result) {
        if (result.is_existing) {
          toast.info('Patient already exists! You can now book an appointment.');
        } else {
          toast.success('New patient created successfully!');
        }
        setShowCreateModal(false);

        // Immediately open booking modal for the new/found patient
        const newPatient: SearchPatientResult = {
          patient_id: result.patient.patient_id,
          full_name: result.patient.full_name || createForm.full_name,
          gender: result.patient.gender,
          email: createForm.email,
          phone: createForm.phone
        };
        openBooking(newPatient);
      }
    } catch (error: any) {
      console.error('Create patient failed:', error);
      toast.error(error?.message || 'Failed to create patient');
    } finally {
      setIsCreating(false);
    }
  }

  const tabs = [
    { id: 'search' as TabId, label: 'Search & Book', icon: Search },
    { id: 'today' as TabId, label: "Today's Patients", icon: Clock },
    { id: 'upcoming' as TabId, label: 'Upcoming', icon: Calendar },
    { id: 'completed' as TabId, label: 'Completed', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-500 text-sm">Search patients, create new records & book appointments</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 w-fit shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Tab Content */}
      {activeTab === 'search' && (
        <div className="space-y-5">
          {/* Search Bar */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Patient by Mobile or Email</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter patient's mobile number or email address to find existing records. If not found, you can create a new patient.
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter mobile number, email, or name..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2 font-medium disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.length === 0 && (
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create New Patient
                  </button>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No patient found with this search</p>
                  <p className="text-gray-400 text-sm mt-2">Create a new patient to proceed with booking</p>
                  <button
                    onClick={openCreateModal}
                    className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md font-medium"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create New Patient & Book Appointment
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.patient_id}
                      className="p-5 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {patient.full_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-base">{patient.full_name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              {patient.phone && (
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                  <Phone className="w-3.5 h-3.5" />
                                  {patient.phone}
                                </span>
                              )}
                              {patient.email && (
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                  <Mail className="w-3.5 h-3.5" />
                                  {patient.email}
                                </span>
                              )}
                              {patient.gender && (
                                <span className="text-sm text-gray-500">
                                  {patient.gender}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDetailPatient(patient)}
                            className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openBooking(patient)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm text-sm font-medium"
                          >
                            <CalendarPlus className="w-4 h-4" />
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Patients List (Today/Upcoming/Completed) */}
      {activeTab !== 'search' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
              <span className="text-gray-500">Loading patients...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No patients found for this view</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.map((item: any, idx: number) => {
                    const patient = item.patient || item;
                    const doctor = item.doctor;
                    return (
                      <tr key={item.appointment_id || idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {patient.full_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{patient.full_name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{patient.patient_id?.slice(0, 12)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {doctor?.full_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.appointment_date
                            ? new Date(item.appointment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.appointment_time
                            ? new Date(`1970-01-01T${item.appointment_time}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDetailPatient(patient)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Patient Detail Modal */}
      {detailPatient && (
        <ModalOverlay onClose={() => setDetailPatient(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Patient Details</h2>
                <button onClick={() => setDetailPatient(null)} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {detailPatient.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{detailPatient.full_name}</p>
                  <p className="text-sm text-gray-500">ID: {detailPatient.patient_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={<UserIcon className="w-4 h-4" />} label="Gender" value={detailPatient.gender || 'N/A'} />
                <DetailItem icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={detailPatient.date_of_birth ? new Date(detailPatient.date_of_birth).toLocaleDateString() : 'N/A'} />
                <DetailItem icon={<Phone className="w-4 h-4" />} label="Phone" value={detailPatient.phone || 'N/A'} />
                <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={detailPatient.email || 'N/A'} />
                {detailPatient.blood_group && <DetailItem icon={<AlertCircle className="w-4 h-4" />} label="Blood Group" value={detailPatient.blood_group} />}
                {detailPatient.abha_id && <DetailItem icon={<CheckCircle className="w-4 h-4" />} label="ABHA ID" value={detailPatient.abha_id} />}
              </div>

              {detailPatient.address && (
                <div className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{detailPatient.address}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => { setDetailPatient(null); openBooking(detailPatient); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-medium"
              >
                <CalendarPlus className="w-5 h-5" />
                Book Appointment
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedPatient && (
        <ModalOverlay onClose={() => setShowBookingModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
                  <p className="text-sm text-gray-500 mt-1">For: <strong>{selectedPatient.full_name}</strong></p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Doctor *</label>
                <select
                  value={bookingForm.doctor_id}
                  onChange={e => setBookingForm(prev => ({ ...prev, doctor_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.full_name} — {doc.specializations || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={bookingForm.appointment_date}
                    onChange={e => setBookingForm(prev => ({ ...prev, appointment_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time *</label>
                  <input
                    type="time"
                    value={bookingForm.appointment_time}
                    onChange={e => setBookingForm(prev => ({ ...prev, appointment_time: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                <select
                  value={bookingForm.type}
                  onChange={e => setBookingForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="teleconsult">Teleconsult</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason / Notes</label>
                <textarea
                  value={bookingForm.reason}
                  onChange={e => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for visit..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBookAppointment}
                  disabled={isBooking}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md font-medium disabled:opacity-50"
                >
                  {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Create Patient Modal */}
      {showCreateModal && (
        <ModalOverlay onClose={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Patient</h2>
                  <p className="text-sm text-gray-500 mt-1">Add patient to database & proceed to booking</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={createForm.full_name}
                  onChange={e => setCreateForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter patient's full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="patient@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={e => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender *</label>
                  <select
                    value={createForm.gender}
                    onChange={e => setCreateForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={createForm.date_of_birth}
                    onChange={e => setCreateForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                  <select
                    value={createForm.blood_group}
                    onChange={e => setCreateForm(prev => ({ ...prev, blood_group: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-- Select --</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ABHA ID</label>
                  <input
                    type="text"
                    value={createForm.abha_id}
                    onChange={e => setCreateForm(prev => ({ ...prev, abha_id: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ABHA Number (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea
                  value={createForm.address}
                  onChange={e => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="Patient's address (optional)"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={handleCreatePatient}
                  disabled={isCreating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md font-medium disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  {isCreating ? 'Creating...' : 'Create & Book Appointment'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// Reusable Modal Overlay
function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// Detail Item
function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status?: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-800' },
    completed: { bg: 'bg-green-100', text: 'text-green-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  };
  const s = status?.toLowerCase() || 'scheduled';
  const c = config[s] || config.scheduled;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {status || 'Scheduled'}
    </span>
  );
}
