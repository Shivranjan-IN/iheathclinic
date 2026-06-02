import { useState, useEffect } from 'react';
import { Card, CardContent } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Avatar, AvatarFallback } from '../common/ui/avatar';
import { Search, Award, Video, Building2 } from 'lucide-react';
import { Navigation } from '../common/Navigation';
import type { PageView } from '../common/types';
import api from '../lib/api';

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
}

interface DoctorDirectoryProps {
  user: any;
  onLoginRequired: () => void;
  onBookAppointment: () => void;
  onNavigate: (view: PageView) => void;
}

export function DoctorDirectory({ user, onLoginRequired, onBookAppointment, onNavigate }: DoctorDirectoryProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors');
        const docs = Array.isArray(response) ? response : (response.data || response.doctors || []);
        setDoctors(Array.isArray(docs) ? docs : []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBook = () => {
    if (!user) {
      onLoginRequired();
    } else if (user.role && user.role.toLowerCase() === 'patient') {
      onBookAppointment();
    } else {
      alert("Only patient accounts can book doctor appointments. Please log in as a patient.");
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    (doc.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.specialization && doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doc.qualifications && doc.qualifications.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      <Navigation onNavigate={onNavigate} />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Consult Top Doctors</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">Find experienced doctors across specialties and book your consultation instantly.</p>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 shadow-sm bg-white p-2 rounded-2xl border border-slate-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search by name or specialty..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none shadow-none pl-10 h-10 sm:h-12 text-sm sm:text-base focus-visible:ring-0"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 px-8 rounded-xl font-medium shadow-md w-full sm:w-auto">
            Search
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
             <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium">Loading our expert doctors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredDoctors.map(doctor => (
              <Card key={doctor.id} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/60 shadow-md bg-white overflow-hidden rounded-2xl">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-5">
                    <Avatar className="w-16 h-16 rounded-2xl shrink-0 shadow-sm border border-slate-100">
                      {doctor.profile_photo_url ? (
                        <img src={doctor.profile_photo_url} alt={doctor.full_name} className="object-cover w-full h-full rounded-2xl" />
                      ) : (
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xl rounded-2xl">
                          {(doctor.full_name || "Doctor").split(' ').map(n => n?.[0] || '').join('').substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 pt-1">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{doctor.full_name}</h3>
                      <p className="text-blue-600 font-semibold text-sm mt-1">{doctor.specialization || 'General Physician'}</p>
                      <p className="text-slate-500 text-xs mt-1.5 font-medium line-clamp-1">{doctor.qualifications}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <Award className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{doctor.experience_years || 0} Years Experience</span>
                    </div>
                    {doctor.languages && doctor.languages.length > 0 && (
                      <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                        <Video className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="line-clamp-1">Speaks: {doctor.languages.join(', ')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="line-clamp-1">{doctor.clinic_name || 'Primary Clinic'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-4 border-t border-slate-100 gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Consultation Fee</span>
                      <span className="font-black text-slate-900 text-xl tracking-tight">₹{doctor.fees || 500}</span>
                    </div>
                    <Button onClick={handleBook} className="bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all rounded-xl px-6 h-11 font-semibold w-full sm:w-auto">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No doctors found</h3>
                <p className="text-slate-500">We couldn't find any doctors matching your search criteria.</p>
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
