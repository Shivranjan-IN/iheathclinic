import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import { Users, Clock, CheckCircle, AlertCircle, Play, RefreshCw, Volume2, XCircle, Activity, ChevronRight, Loader2, Stethoscope, Hash, ScanLine } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast, Toaster } from 'sonner';

interface QueueManagementProps {
  userRole: UserRole;
}

interface QueuePatient {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientId: string;
  doctorName: string;
  appointmentType: string;
  arrivalTime: string;
  estimatedWaitTime: number;
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'no-show';
  priority: 'normal' | 'urgent';
}

export function QueueManagement({ userRole }: QueueManagementProps) {
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 30 seconds for live feel
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await clinicService.getQueue();
      // Map backend appointments to QueuePatient interface
      const mappedQueue: QueuePatient[] = data.map((apt: any, idx: number) => ({
        id: apt.appointment_id,
        tokenNumber: idx + 1,
        patientName: apt.patient?.full_name || 'Anonymous',
        patientId: apt.patient_id,
        doctorName: apt.doctor?.full_name || 'Dr. Assigned',
        appointmentType: apt.appointment_type || 'Consultation',
        arrivalTime: apt.appointment_time ? new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        estimatedWaitTime: Math.max(0, (idx) * 15), // Mock estimation
        status: apt.status || 'scheduled',
        priority: (apt.appointment_type === 'emergency' || apt.ai_risk_level === 'high') ? 'urgent' : 'normal'
      }));
      setQueue(mappedQueue);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast.error('Failed to sync live queue');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const success = await clinicService.updateAppointmentStatus(id, newStatus);
      if (success) {
        toast.success(`Patient status updated to ${newStatus.replace('-', ' ')}`);
        fetchQueue();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const speakToken = (tokenNumber: number, patientName: string, doctorName: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanName = patientName.replace(/[^\w\s]/gi, '');
      const cleanDoctor = doctorName ? doctorName.replace("Dr.", "Doctor") : "the consultation room";
      const text = `Token number ${tokenNumber}, ${cleanName}, please proceed to ${cleanDoctor}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Web Speech API is not supported in this browser.');
    }
  };

  const waitingCount = queue.filter(p => p.status === 'scheduled' || p.status === 'waiting').length;
  const inProgressCount = queue.filter(p => p.status === 'in-progress').length;
  const completedCount = queue.filter(p => p.status === 'completed').length;
  const avgWaitTime = queue.length > 0 ? Math.round(queue.reduce((sum, p) => sum + p.estimatedWaitTime, 0) / queue.length) : 0;

  if (loading && queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <Activity className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="mt-4 font-medium text-gray-600 dark:text-slate-400">Syncing live queue pulse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patient Queue Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time token calling & patient tracking system</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Avg Wait Time</span>
            <div className="flex items-center gap-1.5 text-xl font-bold text-slate-900 dark:text-white">
              <Clock className="w-5 h-5 text-amber-500" />
              {avgWaitTime} min
            </div>
          </div>
          <button 
            onClick={fetchQueue}
            disabled={loading}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-850 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Waiting', count: waitingCount, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-l-4 border-l-amber-500' },
          { label: 'In Consultation', count: inProgressCount, icon: Play, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-l-4 border-l-blue-500', glow: true },
          { label: 'Completed Today', count: completedCount, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-l-4 border-l-emerald-500' },
          { label: 'Total Registered', count: queue.length, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-l-4 border-l-purple-500' }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white dark:bg-slate-900/70 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${stat.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className={`w-5 h-5 ${stat.glow ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Active & Waiting */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* NOW SERVING - Premium Display */}
          <div className="bg-gradient-to-b from-gray-900 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-white text-xl flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                  </span>
                  Now Serving
                </h3>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/80 text-xs font-semibold tracking-wider">
                  ACTIVE CONSULTATIONS
                </div>
              </div>
              
              <div className="space-y-4">
                {queue.filter(p => p.status === 'in-progress').length > 0 ? (
                  queue.filter(p => p.status === 'in-progress').map(patient => (
                    <div key={patient.id} className="bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 transition-all duration-300 group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          {/* Token Bubble */}
                          <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur group-hover:blur-md transition-all opacity-50"></div>
                            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-4 min-w-[100px] text-center shadow-xl border border-white/20">
                              <p className="text-xs font-bold uppercase opacity-80 tracking-widest mb-1">Token</p>
                              <p className="text-4xl font-black">{patient.tokenNumber}</p>
                            </div>
                          </div>
                          
                          {/* Patient Details */}
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">{patient.patientName}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300">
                              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md">
                                <ScanLine className="w-4 h-4 text-emerald-400" />
                                {patient.patientId}
                              </span>
                              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md">
                                <Stethoscope className="w-4 h-4 text-blue-400" />
                                {patient.doctorName}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-3 sm:ml-auto">
                          <button
                            onClick={() => speakToken(patient.tokenNumber, patient.patientName, patient.doctorName)}
                            className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30 transition-all group/btn"
                            title="Call Announcement"
                          >
                            <Volume2 className="w-6 h-6 group-hover/btn:scale-110 group-hover/btn:text-white transition-all" />
                          </button>
                          <span className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl font-bold tracking-wide border border-emerald-500/30">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            IN ROOM
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 font-medium text-lg text-center">No active consultations at the moment</p>
                    <p className="text-gray-600 text-sm mt-1">Ready for the next patient</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WAITING QUEUE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Waiting Queue
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {waitingCount} Waiting
                </span>
                {queue.filter(p => p.priority === 'urgent' && (p.status === 'scheduled' || p.status === 'waiting')).length > 0 && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Urgent
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {queue.filter(p => p.status === 'scheduled' || p.status === 'waiting').length > 0 ? (
                queue.filter(p => p.status === 'scheduled' || p.status === 'waiting').map((patient, idx) => (
                  <div 
                    key={patient.id}
                    className={`p-6 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-all duration-200 ${
                      patient.priority === 'urgent' ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="flex items-center gap-5 flex-1">
                        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-sm ${
                          patient.priority === 'urgent' 
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30' 
                            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'
                        }`}>
                          <Hash className="w-4 h-4 opacity-50 mb-0.5" />
                          <span className="text-xl font-black leading-none">{patient.tokenNumber}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{patient.patientName}</h4>
                            {patient.priority === 'urgent' && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400 mb-2">
                            <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> {patient.doctorName}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700"></span>
                            <span className="font-medium text-gray-500 dark:text-slate-500">{patient.appointmentType}</span>
                          </div>
                          
                          {/* Wait Time Progress */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${idx === 0 ? 'bg-amber-500 animate-pulse' : 'bg-gray-300 dark:bg-slate-600'}`}
                                style={{ width: `${Math.min(100, Math.max(10, 100 - (patient.estimatedWaitTime)))}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold ${idx === 0 ? 'text-amber-600 dark:text-amber-500' : 'text-gray-500 dark:text-slate-400'}`}>
                              Est: {patient.estimatedWaitTime}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => speakToken(patient.tokenNumber, patient.patientName, patient.doctorName)}
                          className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 rounded-xl transition-all border border-indigo-200 dark:border-indigo-500/30"
                          title="Audible Call"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        
                        {(userRole === 'admin' || userRole === 'receptionist' || userRole === 'doctor' || userRole === 'clinic') && (
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                            <button
                              onClick={() => updateStatus(patient.id, 'in-progress')}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold text-sm shadow-sm"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              Start
                            </button>
                            <button
                              onClick={() => updateStatus(patient.id, 'no-show')}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-all"
                              title="Mark No-show"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-slate-700">
                    <CheckCircle className="w-10 h-10 text-gray-400 dark:text-slate-500" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Queue is Clear</h4>
                  <p className="text-gray-500 dark:text-slate-400">All scheduled patients have been attended to.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Completed */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Completed Today
              </h3>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto min-h-[300px]">
              {queue.filter(p => p.status === 'completed').length > 0 ? (
                <div className="space-y-3">
                  {queue.filter(p => p.status === 'completed').map(patient => (
                    <div key={patient.id} className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-black rounded-lg">#{patient.tokenNumber}</span>
                          <span className="px-2 py-1 bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Done
                          </span>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{patient.patientName}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        <span className="truncate">{patient.doctorName}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-gray-100 dark:border-slate-700">
                    <CheckCircle className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                  </div>
                  <p className="text-gray-500 dark:text-slate-400 font-medium">No completed consultations yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
