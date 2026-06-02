import { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    Clock,
    Clock3,
    User,
    Video,
    MapPin,
    MoreHorizontal,
    Filter,
    CheckCircle,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Phone,
    Play,
    Eye,
    Edit2,
    Trash2
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface AppointmentManagementProps {
    onStartAppointment: (appointment: any) => void;
    userRole?: string;
}

export function AppointmentManagement({ onStartAppointment }: AppointmentManagementProps) {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [patientType, setPatientType] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [customRange, setCustomRange] = useState({ from: '', to: '' });
    const [sortBy, setSortBy] = useState('time');
    
    // Modal states
    const [selectedApt, setSelectedApt] = useState<any>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, [user, patientType, dateFilter, customRange]);

    const fetchAppointments = async () => {
        // Don't block — backend uses req.user.doctor_id from JWT middleware
        // But still check user is logged in
        if (!user) return;
        setLoading(true);
        try {
            const filters: any = {
                type: patientType,
                dateFilter: dateFilter
            };
            // Pass doctor_id if we have it in the frontend state (optional optimization)
            if (user.doctor_id) {
                filters.doctor_id = String(user.doctor_id);
            }
            if (dateFilter === 'custom') {
                filters.from = customRange.from;
                filters.to = customRange.to;
            }
            const data = await doctorService.getDoctorAppointments(filters);
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string, appointment: any) => {
        try {
            switch (action) {
                case 'start':
                    await doctorService.startAppointment(appointment.appointment_id);
                    onStartAppointment(appointment);
                    break;
                case 'called':
                    await doctorService.updateAppointmentStatus(appointment.appointment_id, 'in_progress');
                    toast.success('Patient called');
                    fetchAppointments();
                    break;
                case 'delete':
                    if (window.confirm('Are you sure you want to delete this appointment?')) {
                        await doctorService.deleteAppointment(appointment.appointment_id);
                        toast.success('Appointment deleted');
                        fetchAppointments();
                    }
                    break;
                case 'reschedule':
                    setSelectedApt(appointment);
                    setRescheduleData({
                        date: appointment.appointment_date ? new Date(appointment.appointment_date).toISOString().split('T')[0] : '',
                        time: appointment.appointment_time || ''
                    });
                    setShowRescheduleModal(true);
                    break;
                case 'view':
                    setSelectedApt(appointment);
                    setShowViewModal(true);
                    break;
            }
        } catch (error) {
            toast.error(`Operation failed`);
        }
    };

    const handleRescheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApt) return;
        try {
            setSubmitting(true);
            await doctorService.rescheduleAppointment({
                appointment_id: selectedApt.appointment_id,
                appointment_date: rescheduleData.date,
                appointment_time: rescheduleData.time
            });
            toast.success('Appointment rescheduled');
            setShowRescheduleModal(false);
            fetchAppointments();
        } catch (error) {
            toast.error('Reschedule failed');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return 'N/A';
        try {
            if (timeStr.includes('T')) {
                const date = new Date(timeStr);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            }
            return timeStr;
        } catch (e) {
            return timeStr;
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { 
            weekday: 'short', 
            day: '2-digit', 
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-600',
                    border: 'border-emerald-100',
                    icon: CheckCircle2
                };
            case 'in_progress':
                return {
                    bg: 'bg-amber-50',
                    text: 'text-amber-600',
                    border: 'border-amber-100',
                    icon: Clock3
                };
            case 'cancelled':
                return {
                    bg: 'bg-rose-50',
                    text: 'text-rose-600',
                    border: 'border-rose-100',
                    icon: XCircle
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-600',
                    border: 'border-blue-100',
                    icon: AlertCircle
                };
        }
    };

    const sortedAppointments = [...appointments].sort((a, b) => {
        if (sortBy === 'time') return (a.appointment_time || '').localeCompare(b.appointment_time || '');
        if (sortBy === 'date') return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
        return 0;
    }).filter(apt =>
        (apt.patient?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.appointment_id?.toString() || '').includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/60 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] tracking-[0.2em] uppercase">
                        <div className="w-6 h-px bg-blue-600/30" />
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-slate-500 max-w-lg text-sm font-medium">
                        Manage your consultations, track patient status, and optimize your daily workflow.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all outline-none shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Selection/Filters Bar */}
            <div className="flex flex-col xl:flex-row items-stretch gap-4">
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex flex-wrap items-center gap-5">
                    <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-200/60">
                        {['all', 'in-clinic', 'online'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setPatientType(type)}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all relative ${patientType === type
                                    ? 'text-white shadow-md shadow-blue-500/20'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {patientType === type && (
                                    <div className="absolute inset-0 bg-blue-600 rounded-lg z-0" />
                                )}
                                <span className="relative z-10">{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</span>
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden md:block" />

                    <div className="flex flex-wrap items-center gap-2">
                        {['all', 'today', 'yesterday', 'tomorrow', 'custom'].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDateFilter(d)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${dateFilter === d
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}

                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300 ml-2">
                                <input
                                    type="date"
                                    value={customRange.from}
                                    onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] text-slate-900 focus:border-blue-500/50 outline-none"
                                />
                                <span className="text-slate-300 font-bold">-</span>
                                <input
                                    type="date"
                                    value={customRange.to}
                                    onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] text-slate-900 focus:border-blue-500/50 outline-none"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:w-80 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex items-center justify-between px-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Filter className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-none">Sort viewing</span>
                    </div>
                    <div className="relative group/select">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-[11px] pl-3 pr-8 py-2 appearance-none focus:ring-4 focus:ring-blue-500/50 outline-none cursor-pointer uppercase tracking-tight"
                        >
                            <option value="time">Chronological</option>
                            <option value="date">Calendar Date</option>
                        </select>
                        <Clock3 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Patient Details</th>
                                    <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Schedule Info</th>
                                    <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-center">Consult Mode</th>
                                    <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-center">Process Status</th>
                                    <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center pointer-events-none">
                                            <div className="relative flex flex-col items-center">
                                                <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-6" />
                                                <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Synchronizing Records...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sortedAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <div className="max-w-xs mx-auto space-y-4">
                                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto shadow-inner text-slate-300">
                                                    <Calendar className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900">Quiet in the Lobby</h3>
                                                <p className="text-slate-400 text-sm font-medium">No appointments match your current selection filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedAppointments.map((apt) => {
                                        const status = getStatusStyles(apt.status);
                                        const StatusIcon = status.icon;

                                        return (
                                            <tr key={apt.appointment_id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-500">
                                                                {apt.patient?.full_name?.charAt(0) || 'P'}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border-2 border-slate-50 rounded-full flex items-center justify-center shadow-sm">
                                                                <div className={`w-2 h-2 rounded-full ${apt.status === 'scheduled' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`}></div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                                                                {apt.patient?.full_name || 'Anonymous Patient'}
                                                            </p>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-bold">
                                                                    <Phone className="w-3 h-3 text-slate-300" />
                                                                    {apt.patient?.phone || 'Private Number'}
                                                                </span>
                                                                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                                                                    ID-{String(apt.appointment_id).slice(-4).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-blue-500/20 transition-colors">
                                                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                            </div>
                                                            <span className="font-bold text-slate-700 tracking-tight">{formatDate(apt.appointment_date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-purple-500/20 transition-colors">
                                                                <Clock className="w-3.5 h-3.5 text-purple-600" />
                                                            </div>
                                                            <span className="font-medium text-slate-500 text-sm tracking-wide">{formatTime(apt.appointment_time)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all duration-500 ${apt.mode === 'video'
                                                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer'
                                                        }`}>
                                                        {apt.mode === 'video' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                        {apt.mode === 'video' ? 'Virtual' : 'In-Person'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all duration-500 ${status.bg} ${status.text} ${status.border} group-hover:scale-105 shadow-sm`}>
                                                            <StatusIcon className="w-4 h-4" />
                                                            <span>{(apt.status || 'Scheduled').replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                                        {apt.status === 'scheduled' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction('start', apt)}
                                                                    title="Initiate Session"
                                                                    className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                                                                >
                                                                    <Play className="w-4 h-4 fill-current" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction('called', apt)}
                                                                    title="Tele-Check"
                                                                    className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 shadow-sm"
                                                                >
                                                                    <Phone className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleAction('view', apt)}
                                                            className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        
                                                        <div className="relative group/more">
                                                            <button className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-all">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover/more:flex flex-col bg-white border border-slate-100 rounded-2xl shadow-xl p-2 min-w-[170px] z-50 animate-in fade-in slide-in-from-bottom-2">
                                                                <button 
                                                                    onClick={() => handleAction('reschedule', apt)}
                                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm text-slate-600 transition-colors w-full text-left font-bold"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                                                    Reschedule
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleAction('delete', apt)}
                                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-rose-50 text-rose-500 rounded-xl text-sm transition-colors w-full text-left font-bold"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    Remove Record
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .pulse-slow {
                    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
            `}} />

            {/* View Patient Details Modal */}
            {showViewModal && selectedApt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowViewModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex items-end justify-between">
                            <div className="flex items-center gap-6 translate-y-8">
                                <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl">
                                    <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center text-3xl font-black text-blue-600 uppercase border-4 border-white">
                                        {selectedApt.patient?.full_name?.charAt(0) || 'P'}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <h2 className="text-2xl font-black text-white leading-none">{selectedApt.patient?.full_name}</h2>
                                    <p className="text-blue-100 font-bold text-sm mt-1">Patient ID: {selectedApt.patient_id}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors text-white mb-2">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-8 pt-12 grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Personal Information</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Phone className="w-4 h-4 text-blue-500" />
                                            <span className="font-bold text-sm">{selectedApt.patient?.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span className="font-bold text-sm">Age: {selectedApt.patient?.age || 'N/A'} • Gender: {selectedApt.patient?.gender || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            <span className="font-bold text-sm truncate">{selectedApt.patient?.address || 'Address not listed'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-sm">
                                    {selectedApt.reason || 'Reason for visit not specified.'}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Appointment Lifecycle</label>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                <span className="text-xs font-bold text-slate-600">Scheduled Date</span>
                                            </div>
                                            <span className="text-xs font-black text-blue-700">{formatDate(selectedApt.appointment_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-purple-600" />
                                                <span className="text-xs font-bold text-slate-600">Target Time</span>
                                            </div>
                                            <span className="text-xs font-black text-purple-700">{formatTime(selectedApt.appointment_time)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-xs font-bold text-slate-600">Current Status</span>
                                            </div>
                                            <span className="text-xs font-black text-emerald-700 uppercase tracking-tighter">{selectedApt.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 flex gap-4">
                            <button 
                                onClick={() => handleAction('start', selectedApt)}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Start Consultation
                            </button>
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && selectedApt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowRescheduleModal(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-none">Reschedule</h1>
                                <p className="text-sm text-slate-500 font-medium mt-1">Refining appointment timeline</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                        
                        <form onSubmit={handleRescheduleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Consultation Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="date"
                                        required
                                        value={rescheduleData.date}
                                        onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Proposed Time Slot</label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="time"
                                        required
                                        value={rescheduleData.time}
                                        onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                >
                                    {submitting ? 'Updating...' : 'Confirm Update'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRescheduleModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

