import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Activity,
  XCircle,
  Video,
  Building2
} from 'lucide-react';
import { Card, CardContent } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Badge } from '../common/ui/badge';
import { Avatar, AvatarFallback } from '../common/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { Label } from '../common/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../common/ui/dialog';
import type { PatientPage, PatientUser } from './PatientPortal';

interface MyAppointmentsProps {
  patient: PatientUser;
  onNavigate: (page: PatientPage) => void;
}

interface Appointment {
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  mode: string;
  status: string;
  doctor: {
    full_name: string;
    qualifications: string;
    currentMedications?: string[];
    prescriptions?: any[];
  };
  clinic?: {
    clinic_name: string;
  };
  doctor_id: string;
  prescription_id?: string;
  lab_order_id?: string;
}

interface MyAppointmentsProps {
  patient: PatientUser;
  onNavigate: (page: PatientPage) => void;
}

export function MyAppointments({ patient, onNavigate }: MyAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await patientService.getMyAppointments();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching appointments for patient:', patient.id, error);
      }
    };

    fetchAppointments();
  }, [patient.id]);

  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [cancelApt, setCancelApt] = useState<Appointment | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchAvailableSlots = async (doctorId: string, dateStr: string) => {
    try {
      setLoadingSlots(true);
      // Pass patientId to ensure busy times for the patient are also blocked
      const res = await api.get(`/appointments/booked-slots/${doctorId}/${dateStr}?patientId=${patient.id}`);
      const bookedData = res.bookedSlots || res.data?.bookedSlots || [];
      
      const allSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
      ];
      
      const now = new Date();
      const [year, month, day] = dateStr.split('-').map(Number);
      
      const filtered = allSlots.filter(time => {
        // 1. Check if it's in the backend's "booked" list
        const isBooked = bookedData.some((bookedTime: string) => bookedTime.trim() === time.trim());
        if (isBooked) return false;

        // 2. Filter out past time slots if date is today
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
        // Minimum 1 hour in advance
        const minAllowedTime = new Date(now.getTime() + 60 * 60 * 1000);
        
        return slotDateTime >= minAllowedTime;
      });

      setAvailableSlots(filtered);
    } catch (e) {
      console.error('Failed to fetch available slots', e);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
   // Re-fetch when date changes
  useEffect(() => {
    if (rescheduleApt && rescheduleDate) {
      fetchAvailableSlots(rescheduleApt.doctor_id, rescheduleDate);
    } else {
        setAvailableSlots([]);
    }
  }, [rescheduleDate, rescheduleApt]);

  const handleReschedule = async () => {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) {
      toast.error('Select Date and Time');
      return;
    }
    setProcessing(true);
    const success = await patientService.rescheduleAppointment(rescheduleApt.appointment_id, rescheduleDate, rescheduleTime);
    setProcessing(false);
    if (success) {
      toast.success('Appointment rescheduled');
      setRescheduleApt(null);
      // Re-fetch
      const data = await patientService.getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } else {
      toast.error('Failed to reschedule');
    }
  };

  const handleCancel = async () => {
    if (!cancelApt) return;
    setProcessing(true);
    const success = await patientService.updateAppointmentStatus(cancelApt.appointment_id, 'cancelled');
    setProcessing(false);
    if (success) {
      toast.success('Appointment cancelled');
      setCancelApt(null);
      const data = await patientService.getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } else {
      toast.error('Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch =
      apt.doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor.qualifications?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.clinic?.clinic_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-pink-600">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-600">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-600">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900 mb-1">My Appointments</h1>
          <p className="text-sm text-gray-600">Manage and track all your appointments</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          onClick={() => onNavigate('book-appointment')}
        >
          <Calendar className="size-4 mr-2" />
          Book New Appointment
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-pink-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  placeholder="Search appointments by doctor, specialization, or clinic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-pink-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Scheduled</p>
            <p className="text-2xl font-bold text-purple-900">{stats.scheduled}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card className="border-pink-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50 border-b border-pink-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-pink-900">Date & Time</th>
                  <th className="text-left p-4 text-sm font-semibold text-pink-900">Doctor</th>
                  <th className="text-left p-4 text-sm font-semibold text-pink-900">Specialization</th>
                  <th className="text-left p-4 text-sm font-semibold text-pink-900">Type</th>
                  <th className="text-left p-4 text-sm font-semibold text-pink-900">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-pink-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No appointments found matching your criteria.
                    </td>
                  </tr>
                ) : (
                      filteredAppointments.map((apt, index) => {
                    const appointmentDate = new Date(apt.appointment_date);
                    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    
                    const formatTime = (timeStr: string | null | undefined) => {
                      if (!timeStr) return 'TBD';
                      if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
                      try {
                        const date = new Date(timeStr);
                        const hour = date.getUTCHours();
                        const minute = date.getUTCMinutes();
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour % 12 || 12;
                        return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
                      } catch (e) { return timeStr; }
                    };

                    const formattedTime = formatTime(apt.appointment_time);
                    const doctorInitials = (apt.doctor?.full_name || 'D').split(' ').map(n => n[0]).join('').toUpperCase();
                    const canJoin = apt.status === 'scheduled' && apt.mode === 'video';

                    return (
                      <tr
                        key={apt.appointment_id}
                        className={`border-b border-gray-100 hover:bg-pink-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{formattedDate}</p>
                            <p className="text-sm text-gray-600">{formattedTime}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10">
                              <AvatarFallback className="bg-pink-600 text-white">
                                {doctorInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{apt.doctor?.full_name || 'Unknown Doctor'}</p>
                              <p className="text-sm text-gray-600">{apt.clinic?.clinic_name || 'Clinic'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-900">{apt.doctor.qualifications || 'General Medicine'}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {apt.mode === 'video' ? (
                              <>
                                <Video className="size-4 text-blue-600" />
                                <span className="text-sm text-gray-900">Video Consultation</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="size-4 text-green-600" />
                                <span className="text-sm text-gray-900">In-Clinic</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(apt.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {canJoin && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Video className="size-4 mr-1" />
                                Join Call
                              </Button>
                            )}
                            {apt.status === 'completed' && (
                              <div className="flex flex-col gap-1">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200" onClick={() => onNavigate('prescriptions')}>
                                    <Eye className="size-4 mr-1" />
                                    View Prescription
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-200"
                                    onClick={() => apt.prescription_id && patientService.downloadWithAuth(
                                      patientService.downloadPrescriptionUrl(apt.prescription_id),
                                      `prescription-${apt.prescription_id}.txt`
                                    )}
                                  >
                                    <Download className="size-4 mr-1" />
                                    Download RX
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="text-purple-600 border-purple-200" onClick={() => onNavigate('reports')}>
                                    <Activity className="size-4 mr-1" />
                                    View Lab Report
                                  </Button>
                                </div>
                              </div>
                            )}
                            {apt.status === 'scheduled' && !canJoin && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setRescheduleApt(apt);
                                    // Extract date part from ISO string
                                    const datePart = apt.appointment_date.includes('T') 
                                      ? apt.appointment_date.split('T')[0] 
                                      : apt.appointment_date;
                                    setRescheduleDate(datePart);
                                    setRescheduleTime('');
                                  }}
                                >
                                  <Calendar className="size-4 mr-1" />
                                  Reschedule
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setCancelApt(apt)}>
                                  <XCircle className="size-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleApt} onOpenChange={() => setRescheduleApt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select New Date</Label>
              <Input 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={rescheduleDate} 
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setRescheduleTime('');
                }} 
              />
            </div>
            {rescheduleDate && (
              <div>
                <Label>Select New Time</Label>
                {loadingSlots ? (
                  <p className="text-sm text-gray-500">Loading available slots...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-red-500">No slots available on this date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableSlots.map(slot => (
                      <Button
                        key={slot}
                        type="button"
                        variant={rescheduleTime === slot ? 'default' : 'outline'}
                        className={`text-sm ${rescheduleTime === slot ? 'bg-pink-600 text-white' : ''}`}
                        onClick={() => setRescheduleTime(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleApt(null)}>Close</Button>
            <Button disabled={processing || !rescheduleDate || !rescheduleTime} onClick={handleReschedule} className="bg-pink-600 hover:bg-pink-700">
              {processing ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelApt} onOpenChange={() => setCancelApt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to cancel this appointment?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelApt(null)}>No, Keep It</Button>
            <Button disabled={processing} className="bg-red-600 hover:bg-red-700 text-white" onClick={handleCancel}>
              {processing ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}