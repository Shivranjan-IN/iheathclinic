import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import { Calendar, Clock, Plus, Filter, ChevronLeft, ChevronRight, User, Sparkles } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { Toaster, toast } from 'sonner';

interface AppointmentManagementProps {
  userRole: UserRole;
}

interface Appointment {
  appointment_id: string;
  patient_id: string;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: string;
  patient?: any;
  doctor?: any;
}

// Mocks removed

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export function AppointmentManagement({ userRole }: AppointmentManagementProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptData, docData, patData] = await Promise.all([
        clinicService.getAppointments(),
        clinicService.getDoctors(),
        clinicService.getAllPatients()
      ]);
      setAppointments(aptData);
      setDoctors(docData);
      setPatients(patData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      patient_id: formData.get('patient_id'),
      doctor_id: formData.get('doctor_id'),
      appointment_date: formData.get('date'),
      appointment_time: formData.get('time'),
      type: formData.get('type'),
      reason: formData.get('reason')
    };

    try {
      const success = await clinicService.createAppointment(data);
      if (success) {
        toast.success('Appointment booked successfully');
        setShowAddModal(false);
        fetchData();
      } else {
        toast.error('Failed to book appointment');
      }
    } catch (error) {
      toast.error('Error booking appointment');
    }
  };

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Schedule and manage patient appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
            >
              Calendar View
            </button>
          </div>
          {(userRole === 'admin' || userRole === 'receptionist') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Book Appointment
            </button>
          )}
        </div>
      </div>

      {/* AI Smart Suggestions */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">AI Smart Slot Suggestion</h3>
            <p className="text-sm text-gray-700">
              Based on current appointments, we suggest scheduling next patient at <strong>12:00 PM</strong> with Dr. Sarah Johnson.
              No-show risk detected for appointment #A004 - reminder sent automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {['all', 'scheduled', 'waiting', 'in-progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'list' ? (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Clinic Schedule - {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <span className="text-sm text-gray-600">{filteredAppointments.length} appointments</span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredAppointments.length > 0 ? filteredAppointments.map((appointment, idx) => (
              <div key={appointment.appointment_id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 rounded-lg p-3 text-center min-w-[60px]">
                      <p className="text-xs text-blue-600 font-medium">Spot</p>
                      <p className="text-xl font-bold text-blue-700">{idx + 1}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{appointment.patient?.full_name || 'Anonymous'}</h3>
                        <span className="text-xs text-gray-500">({appointment.patient_id.slice(0, 8)})</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {appointment.doctor?.full_name || 'Assigned Doctor'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.appointment_time ? new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${appointment.type === 'consultation' ? 'bg-purple-100 text-purple-700' :
                          appointment.type === 'follow-up' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                          {appointment.appointment_type || appointment.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        appointment.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                          appointment.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                            'bg-red-100 text-red-700'
                      }`}>
                      {(appointment.status || 'scheduled').charAt(0).toUpperCase() + (appointment.status || 'scheduled').slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-500">
                {loading ? 'Refreshing medical pulse...' : 'No appointments synchronized for this period'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button className="text-sm text-blue-600 hover:underline">
              Go to Today
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {doctors.map(doctor => (
              <div key={doctor.id}>
                <h3 className="font-semibold text-gray-900 mb-3">{doctor.full_name}</h3>
                <div className="space-y-2">
                  {timeSlots.map(slot => {
                    const appointment = appointments.find(
                      apt => apt.doctor_id === doctor.id && new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) === slot
                    );

                    return (
                      <div
                        key={slot}
                        className={`p-3 rounded-lg border transition-colors ${appointment
                          ? 'border-blue-300 bg-blue-50 cursor-pointer hover:bg-blue-100'
                          : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{slot}</span>
                          {appointment ? (
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{appointment.patient?.full_name}</p>
                              <p className="text-xs text-gray-600">{appointment.status}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Available</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Book New Appointment</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <Toaster />
              <form className="space-y-4" onSubmit={handleBookAppointment}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                    <select name="patient_id" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Select Patient</option>
                      {patients.map(p => (
                        <option key={p.patient_id} value={p.patient_id}>
                          {p.full_name} ({p.patient_id.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                    <select name="doctor_id" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Select Doctor</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input name="date" type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <select name="time" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Select Time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
                    <select name="type" required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="checkup">Checkup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>In-Clinic</option>
                      <option>Online</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                  <textarea name="reason" className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2}></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
