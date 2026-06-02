import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building2,
  Search,
  MapPin,
  Award,
  ChevronRight,
  Check,
  Star,
  Activity,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { Badge } from '../common/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../common/ui/avatar';
import { Calendar } from '../common/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '../common/ui/tabs';
import { Textarea } from '../common/ui/textarea';
import { toast } from 'sonner';
import api from "../lib/api";
import type { PatientUser } from './PatientPortal';

interface BookAppointmentProps {
  patient: PatientUser;
}

interface Doctor {
  id: number;
  full_name: string;
  specialization: string;
  experience_years: number;
  fees: number;
  profile_photo_url?: string;
  languages?: string[];
  qualifications?: string;
  address?: string;
  clinic_name?: string;
  clinic_address?: string;
  rating?: number;
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const isValidDate = (date: Date | undefined): boolean => {
  if (!date) return false;
  return !isNaN(date.getTime()) && isFinite(date.getTime());
};

export function BookAppointment({ patient }: BookAppointmentProps) {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-clinic' | 'video'>('in-clinic');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<{ time: string; status: 'available' | 'booked' | 'expired' }[]>([]);
  const [tokenNumber, setTokenNumber] = useState<string | number>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors');
        const doctorsList = Array.isArray(response) ? response : (response.data || response.doctors || []);
        setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDoctor || !selectedDate || !isValidDate(selectedDate)) return;
      setLoadingSlots(true);
      setSelectedTime('');
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await api.get(`/appointments/booked-slots/${selectedDoctor.id}/${dateStr}?patientId=${patient.id}`);
        const bookedSlotsData = Array.isArray(response.bookedSlots) ? response.bookedSlots : (response.data?.bookedSlots || []);
        setBookedSlots(bookedSlotsData);
        
        const slotsData = Array.isArray(response.slots) ? response.slots : (response.data?.slots || []);
        setAllSlots(slotsData);
      } catch (error) {
        console.error('Failed to fetch booked slots:', error);
        setBookedSlots([]);
        setAllSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchBookedSlots();
  }, [selectedDoctor, selectedDate]);

  const filteredDoctors = doctors.filter(doc =>
    doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.specialization && doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    if (!isValidDate(selectedDate)) { toast.error('Invalid Date'); return; }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    setBookingLoading(true);
    try {
      const convertTimeTo24Hour = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (modifier === 'PM' && hours !== '12') hours = (parseInt(hours, 10) + 12).toString();
        if (modifier === 'AM' && hours === '12') hours = '00';
        return `${hours.padStart(2, '0')}:${minutes}:00`;
      };
      const formattedTime = convertTimeTo24Hour(selectedTime);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const appointmentData = {
        patient_id: patient.id.toString(),
        doctor_id: selectedDoctor.id,
        appointment_date: dateString,
        appointment_time: formattedTime,
        type: appointmentType,
        mode: appointmentType === 'video' ? 'online' : 'offline',
        status: 'scheduled',
        consult_duration: 30,
        earnings: selectedDoctor.fees || 500,
        reason_for_visit: reasonForVisit || null
      };

      const response = await api.post('/appointments', appointmentData);
      const bookingData = response.data || response;
      if (response.success || bookingData?.appointment_id) {
        setAppointmentId(bookingData.appointment_id || bookingData.id || 'APT-'+Date.now());
        setTokenNumber(bookingData.token_number || '1');
        toast.success('Appointment booked successfully.');
        setStep(4);
      } else throw new Error(response.message || 'Failed to book');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.data?.message || error.message || 'Failed to book appointment. Please try again.';
      toast.error(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, { backgroundColor: null, scale: 2 });
        const link = document.createElement('a');
        link.download = `receipt-${appointmentId}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
      } catch (error) {
        toast.error('Failed to download receipt');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400">
            Book an Appointment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Find and book appointments with our expert specialists.</p>
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="flex items-center justify-center mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10" />
        <div className="flex justify-between w-full max-w-3xl">
          {[1, 2, 3, 4].map((s, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-900 px-4">
              <div className={`size-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
                step === s ? 'border-pink-600 bg-pink-600 text-white dark:border-pink-500 dark:bg-pink-500' :
                step > s ? 'border-purple-600 bg-purple-600 text-white dark:border-purple-500 dark:bg-purple-500' :
                'border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800'
              }`}>
                {step > s ? <Check className="size-5" /> : s}
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider hidden md:block ${step >= s ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                {s === 1 ? 'Doctor' : s === 2 ? 'Schedule' : s === 3 ? 'Review' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
            <Input 
              placeholder="Search by doctor name or specialty..." 
              className="pl-10 h-12 text-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-pink-500 focus:border-pink-500 rounded-full shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => (
                <Card key={doctor.id} className="group overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 dark:hover:shadow-pink-900/20 bg-white dark:bg-gray-900">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="size-20 border-2 border-white dark:border-gray-800 shadow-md">
                          <AvatarImage src={doctor.profile_photo_url} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-xl">
                            {doctor.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                            Dr. {doctor.full_name}
                          </h3>
                          <p className="text-pink-600 dark:text-pink-400 font-medium text-sm mb-1">{doctor.specialization}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{doctor.rating || 4.8}</span>
                            <span>({doctor.experience_years}y exp)</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><Building2 className="size-4" /></div>
                          <span className="font-medium">{doctor.clinic_name || 'Autellia Clinic'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><CreditCard className="size-4" /></div>
                          <span className="font-medium">₹{doctor.fees || 500} Consultation Fee</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 mt-auto">
                      <Button 
                        onClick={() => handleDoctorSelect(doctor)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-pink-600 dark:hover:bg-pink-700 transition-colors"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                  <Activity className="size-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No doctors found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedDoctor && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
          <Button variant="ghost" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 -ml-4">
            <ArrowLeft className="size-4 mr-2" /> Back to Doctors
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="size-24 mx-auto mb-4 border-2 border-pink-100 dark:border-pink-900/50 shadow-md">
                      <AvatarImage src={selectedDoctor.profile_photo_url} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-2xl">
                        {selectedDoctor.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="font-bold text-xl text-gray-900 dark:text-gray-100">Dr. {selectedDoctor.full_name}</h2>
                    <p className="text-pink-600 dark:text-pink-400 font-medium">{selectedDoctor.specialization}</p>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Experience</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedDoctor.experience_years} Years</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Consultation Fee</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">₹{selectedDoctor.fees || 500}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Activity className="size-4 text-pink-500" />
                    Appointment Type
                  </h3>
                </div>
                <CardContent className="p-4">
                  <Tabs value={appointmentType} onValueChange={(v) => setAppointmentType(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <TabsTrigger value="in-clinic" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                        <Building2 className="size-4 mr-2" /> Clinic
                      </TabsTrigger>
                      <TabsTrigger value="video" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                        <Video className="size-4 mr-2" /> Video
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="size-5 text-purple-500" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border border-gray-100 dark:border-gray-800 p-3"
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                  />
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="size-5 text-pink-500" />
                    Available Slots
                  </CardTitle>
                  {loadingSlots && <span className="text-sm text-pink-600 dark:text-pink-400 animate-pulse">Loading slots...</span>}
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {allSlots
                      .filter(slot => slot.status !== 'booked')
                      .map(slot => {
                         const isSelected = selectedTime === slot.time;
                         const isExpired = slot.status === 'expired';
                         return (
                           <Button
                             key={slot.time}
                             variant={isSelected ? "default" : "outline"}
                             disabled={isExpired || loadingSlots}
                             onClick={() => !isExpired && setSelectedTime(slot.time)}
                             className={`w-full transition-all ${
                               isSelected 
                                 ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-md shadow-pink-500/20 border-transparent' 
                                 : isExpired 
                                   ? 'opacity-45 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                                   : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 hover:border-green-300'
                             }`}
                           >
                             {slot.time}
                           </Button>
                         );
                    })}
                    {allSlots.filter(slot => slot.status !== 'booked').length === 0 && (
                      <p className="col-span-full text-center text-sm text-gray-500 py-4">No slots available for this date.</p>
                    )}
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button 
                      onClick={() => setStep(3)} 
                      disabled={!selectedDate || !selectedTime}
                      className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-pink-600 dark:hover:bg-pink-700 px-8 py-6 text-lg rounded-xl shadow-lg shadow-gray-900/10 dark:shadow-pink-900/20"
                    >
                      Continue to Review <ChevronRight className="ml-2 size-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {step === 3 && selectedDoctor && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 -ml-4">
            <ArrowLeft className="size-4 mr-2" /> Back to Schedule
          </Button>
          
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Review Your Booking</h2>
              <p className="opacity-90 mt-1">Please confirm the details below</p>
            </div>
            
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <Avatar className="size-20 border-2 border-white dark:border-gray-700 shadow-sm">
                  <AvatarImage src={selectedDoctor.profile_photo_url} />
                  <AvatarFallback>{selectedDoctor.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">Dr. {selectedDoctor.full_name}</h3>
                  <p className="text-pink-600 dark:text-pink-400 font-medium">{selectedDoctor.specialization}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1"><CalendarIcon className="size-4" /> Date</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1"><Clock className="size-4" /> Time</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedTime}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="reason" className="text-base text-gray-700 dark:text-gray-300">Reason for visit (Optional)</Label>
                <Textarea 
                  id="reason"
                  placeholder="Briefly describe your symptoms or reason for consultation..." 
                  className="min-h-[100px] resize-none bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-pink-500 rounded-xl"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                />
              </div>
              
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 dark:text-gray-400 text-lg">Total Amount</span>
                  <span className="font-bold text-3xl text-gray-900 dark:text-gray-100">₹{selectedDoctor.fees || 500}</span>
                </div>
                
                <Button 
                  onClick={handleBooking} 
                  disabled={bookingLoading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-14 text-lg rounded-xl shadow-lg shadow-pink-500/25 transition-all"
                >
                  {bookingLoading ? (
                    <span className="flex items-center gap-2"><Activity className="size-5 animate-spin" /> Confirming...</span>
                  ) : 'Confirm & Book Appointment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 4 && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
          <Card className="border border-green-200 dark:border-green-900/50 shadow-2xl overflow-hidden rounded-2xl relative" ref={receiptRef}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 dark:bg-green-500/5 rounded-bl-full -z-10" />
            <CardContent className="p-10 text-center space-y-6 bg-white dark:bg-gray-900">
              <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2 shadow-inner">
                <Check className="size-12 text-green-600 dark:text-green-400 animate-in spin-in-180 duration-700" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Booking Confirmed!</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Your appointment has been successfully scheduled.</p>
              
              <div className="bg-gray-50 dark:bg-gray-800/80 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 text-left space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Appointment ID</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100 mt-1">{appointmentId}</p>
                    {tokenNumber && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Token Number</p>
                        <p className="font-bold text-lg text-pink-600 dark:text-pink-400 mt-0.5">#{tokenNumber}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Patient</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{patient.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 py-2">
                  <Avatar className="size-12 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={selectedDoctor?.profile_photo_url} />
                    <AvatarFallback>{selectedDoctor?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Dr. {selectedDoctor?.full_name}</p>
                    <p className="text-sm text-pink-600 dark:text-pink-400">{selectedDoctor?.specialization}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-2">
                    <CalendarIcon className="size-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Date & Time</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedDate?.toLocaleDateString()}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    {appointmentType === 'in-clinic' ? (
                      <Building2 className="size-5 text-blue-500 shrink-0 mt-0.5" />
                    ) : (
                      <Video className="size-5 text-green-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Type</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{appointmentType === 'in-clinic' ? 'In-Clinic' : 'Video Consult'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button variant="outline" onClick={downloadReceipt} className="border-pink-200 text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-400 dark:hover:bg-pink-900/20 h-12 px-6 rounded-xl">
              Download Receipt
            </Button>
            <Button onClick={() => window.location.reload()} className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 h-12 px-6 rounded-xl shadow-lg">
              Book Another Appointment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
