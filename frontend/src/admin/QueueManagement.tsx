import { useEffect, useState } from 'react';
import { UserRole } from '../common/types';
import { clinicService } from '../services/clinicService';
import { Users, Clock, CheckCircle, Play, Loader2, Volume2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface QueueManagementProps {
    userRole: UserRole;
}

export function QueueManagement({ userRole }: QueueManagementProps) {
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const data = await clinicService.getQueue();
            setQueue(data);
        } catch (error) {
            console.error('Error fetching queue:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const success = await clinicService.updateAppointment(id, { status: newStatus });
            if (success) {
                setQueue(prev => prev.map(patient =>
                    patient.appointment_id === id ? { ...patient, status: newStatus } : patient
                ));
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('An error occurred during status update');
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
            alert('Web Speech API is not supported in this browser.');
        }
    };

    const waitingCount = queue.filter(p => p.status === 'scheduled').length;
    const inProgressCount = queue.filter(p => p.status === 'in-progress').length;
    const completedTodayCount = queue.filter(p => p.status === 'completed').length;

    if (loading && queue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-slate-400">Syncing live queue pulse...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Patient Queue Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time patient queue calling and token dispatch</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={fetchQueue}
                        disabled={loading}
                        className="p-3 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        title="Sync Queue Stream"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Live Operation Mode</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Waiting Patients', value: waitingCount, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-l-4 border-l-amber-500' },
                  { label: 'In Consultation', value: inProgressCount, icon: Play, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-l-4 border-l-blue-500' },
                  { label: 'Completed Today', value: completedTodayCount, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-l-4 border-l-emerald-500' },
                  { label: 'Total Registered', value: queue.length, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-l-4 border-l-purple-500' }
                ].map((stat, idx) => (
                  <div key={idx} className={`bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${stat.border}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  </div>
                ))}
            </div>

            {/* Now Serving View */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden backdrop-blur-md">
                <div className="p-5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40">
                    <h3 className="font-extrabold text-slate-950 dark:text-white text-lg flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        Active Consultation Room Status
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    {queue.filter(p => p.status === 'in-progress').length > 0 ? (
                        queue.filter(p => p.status === 'in-progress').map((apt, idx) => (
                            <div key={apt.appointment_id} className="bg-gradient-to-r from-emerald-50/30 to-indigo-50/10 dark:from-emerald-950/10 dark:to-slate-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className="bg-gradient-to-br from-emerald-500 to-indigo-600 text-white rounded-xl p-4 min-w-[90px] text-center shadow-md">
                                            <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Active</p>
                                            <p className="text-3xl font-black mt-0.5">{idx + 1}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{apt.patient?.full_name}</h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                                                <span>Reg ID: <strong className="font-semibold text-slate-700 dark:text-slate-350">{apt.patient_id}</strong></span>
                                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                                <span>Doctor: <strong className="font-semibold text-slate-700 dark:text-slate-350">{apt.doctor?.full_name}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                                        <button
                                            onClick={() => speakToken(idx + 1, apt.patient?.full_name || 'Patient', apt.doctor?.full_name || '')}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg animate-in"
                                            title="Trigger Megaphone Voice Call Out"
                                        >
                                            <Volume2 className="w-4 h-4 animate-bounce" />
                                            Call Out
                                        </button>
                                        <span className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-450 rounded-xl text-xs font-bold uppercase tracking-wider">
                                            <Play className="w-3.5 h-3.5 fill-current" />
                                            In Consultation
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
                            <p className="text-slate-400 dark:text-slate-500 font-semibold">No patient is currently being consulted</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Scheduled Waiting Queue */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden backdrop-blur-md">
                <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
                    <h3 className="font-extrabold text-slate-950 dark:text-white text-lg">Scheduled Waiting Queue</h3>
                    <span className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-250 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-extrabold uppercase tracking-wider">
                        {waitingCount} Waiting
                    </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {queue.filter(p => p.status === 'scheduled').length > 0 ? (
                        queue.filter(p => p.status === 'scheduled').map((apt, idx) => (
                            <div key={apt.appointment_id} className="p-6 hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-all duration-200">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-xl p-3 min-w-[80px] text-center bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                                            <p className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest mb-0.5">Token</p>
                                            <p className="text-2xl font-black text-indigo-900 dark:text-indigo-405">{idx + 1}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-slate-950 dark:text-white text-lg">{apt.patient?.full_name}</h4>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                <span>ID: <strong className="font-semibold text-slate-700 dark:text-slate-350">{apt.patient_id}</strong></span>
                                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                                <span>Doctor: <strong className="font-semibold text-slate-700 dark:text-slate-350">{apt.doctor?.full_name}</strong></span>
                                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase rounded text-slate-650 dark:text-slate-400">{apt.type}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>Appointment Schedule: {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
                                        <button
                                            onClick={() => speakToken(idx + 1, apt.patient?.full_name || 'Patient', apt.doctor?.full_name || '')}
                                            className="p-2.5 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl transition-all shadow-sm"
                                            title="TTS Token Callout"
                                        >
                                            <Volume2 className="w-5 h-5" />
                                        </button>
                                        {(userRole === 'clinic' || userRole === 'receptionist') && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(apt.appointment_id, 'in-progress')}
                                                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-750 font-bold text-sm shadow-md hover:shadow-lg transition-all"
                                                >
                                                    <Play className="w-4 h-4 fill-current" />
                                                    Start Session
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(apt.appointment_id, 'cancelled')}
                                                    className="flex items-center gap-1.5 px-4 py-2.5 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold text-sm"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 text-center text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-900/10">
                            No patient is currently waiting in the queue
                        </div>
                    )}
                </div>
            </div>

            {/* Completed consultations */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden backdrop-blur-md">
                <div className="p-5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40">
                    <h3 className="font-extrabold text-slate-950 dark:text-white text-lg">Completed Consultations</h3>
                </div>
                <div className="p-6">
                    {queue.filter(p => p.status === 'completed').length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {queue.filter(p => p.status === 'completed').map((apt, idx) => (
                                <div key={apt.appointment_id} className="p-5 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3.5">
                                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Token {idx + 1}</span>
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="font-bold text-slate-950 dark:text-white text-lg">{apt.patient?.full_name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Doctor: <span className="font-bold text-slate-700 dark:text-slate-350">{apt.doctor?.full_name}</span></p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border-2 border-dashed border-slate-250 dark:border-slate-800">
                            No completed appointments registered today
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

