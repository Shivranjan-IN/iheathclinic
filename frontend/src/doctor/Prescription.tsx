import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, User, FileText, Pill, Clock, Info } from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { toast } from 'sonner';

interface PrescriptionProps {
    appointment: any;
    onBack: () => void;
}

const FREQUENCY_OPTIONS = [
    { value: '1-1-1-1', label: '1-1-1-1', desc: 'Full day (4 times)' },
    { value: '1-0-1-0', label: '1-0-1-0', desc: 'Morning & Evening only' },
    { value: '0-1-0-1', label: '0-1-0-1', desc: 'Afternoon & Night only' },
    { value: '1-0-0-1', label: '1-0-0-1', desc: 'Morning & Night' },
    { value: '1-1-1',   label: '1-1-1',   desc: 'Morning, Afternoon & Night' },
    { value: '1-0-1',   label: '1-0-1',   desc: 'Morning & Night' },
    { value: '1-0-0',   label: '1-0-0',   desc: 'Morning only' },
    { value: '0-1-0',   label: '0-1-0',   desc: 'Afternoon only' },
    { value: '0-0-1',   label: '0-0-1',   desc: 'Night only' },
];

export function Prescription({ appointment, onBack }: PrescriptionProps) {
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
    const [loading, setLoading] = useState(false);

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedicine = (index: number) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const updateMedicine = (index: number, field: string, value: string) => {
        const newMedicines = [...medicines];
        newMedicines[index] = { ...newMedicines[index], [field]: value };
        setMedicines(newMedicines);
    };

    const handleSave = async () => {
        if (!diagnosis) {
            toast.error('Diagnosis is required');
            return;
        }
        setLoading(true);
        try {
            const prescriptionData = {
                appointment_id: appointment.appointment_id,
                patient_id: appointment.patient_id,
                doctor_id: appointment.doctor_id,
                diagnosis,
                notes,
                medicines: medicines.filter(m => m.name),
            };
            await doctorService.createDoctorPrescription(prescriptionData);
            await doctorService.updateAppointmentStatus(appointment.appointment_id, 'completed');
            toast.success('Prescription saved successfully');
            onBack();
        } catch (error) {
            console.error('Error saving prescription:', error);
            toast.error('Failed to save prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-50 via-white to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button
                        onClick={onBack}
                        className="group p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-800 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Prescription Terminal</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-mono rounded-md border border-blue-200">
                                {appointment.appointment_id}
                            </span>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-500 text-sm font-medium">Drafting Digital Prescription</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="px-5 py-2.5 text-gray-500 hover:text-gray-800 font-medium transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Complete &amp; Save</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Left: Patient + Clinical ── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Patient Card */}
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                            <User className="w-24 h-24 text-blue-600" />
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Patient Profile</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {appointment.patient?.full_name || 'N/A'}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-gray-500 font-medium">
                                    <span>{appointment.patient?.age || 'N/A'} Yrs</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span className="capitalize">{appointment.patient?.gender || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                    <p className="text-sm text-gray-700 font-semibold">
                                        {new Date(appointment.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time</p>
                                    <p className="text-sm text-gray-700 font-semibold">{appointment.appointment_time}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mode</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        appointment.mode === 'video'
                                            ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                            : 'bg-green-50 text-green-600 border border-green-100'
                                    }`}>
                                        {appointment.mode === 'video' ? 'Tele-Consult' : 'In-Person'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <span className="text-sm text-blue-600 font-bold capitalize">{appointment.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Findings */}
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                                <FileText className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Clinical Data</span>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    Diagnosis <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="Enter clinical diagnosis..."
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all resize-none text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    Clinical Advice
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Dietary advice or lifestyle changes..."
                                    rows={4}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all resize-none text-sm leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Medicines ── */}
                <div className="lg:col-span-8 flex flex-col">
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-md flex-1 flex flex-col overflow-hidden">

                        {/* Card Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                    <Pill className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Prescribed Medicines</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5">Define medication and dosage schedules</p>
                                </div>
                            </div>

                            <button
                                onClick={addMedicine}
                                className="group flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 rounded-xl transition-all duration-300 font-bold text-sm shadow-sm"
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                <span>Add Medicine</span>
                            </button>
                        </div>

                        {/* Medicine Rows */}
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[600px]">
                            {medicines.map((medicine, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-blue-50/30 hover:border-blue-100 transition-all duration-300"
                                >
                                    {/* Medicine Name */}
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Medicine Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Pill className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={medicine.name}
                                                onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                                placeholder="e.g. Paracetamol"
                                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 font-medium placeholder-gray-400 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Dosage */}
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Dosage</label>
                                        <input
                                            type="text"
                                            value={medicine.dosage}
                                            onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                            placeholder="500mg"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 font-medium placeholder-gray-400 transition-all"
                                        />
                                    </div>

                                    {/* Frequency */}
                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Frequency</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                            <select
                                                value={medicine.frequency}
                                                onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 font-medium appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="" disabled>Select Dosage</option>
                                                {FREQUENCY_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {medicine.frequency && (
                                            <p className="text-[10px] text-blue-600 font-semibold mt-1 ml-1">
                                                {FREQUENCY_OPTIONS.find(o => o.value === medicine.frequency)?.desc}
                                            </p>
                                        )}
                                    </div>

                                    {/* Duration */}
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Duration</label>
                                        <input
                                            type="text"
                                            value={medicine.duration}
                                            onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                            placeholder="5 Days"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 font-medium text-center placeholder-gray-400 transition-all"
                                        />
                                    </div>

                                    {/* Remove */}
                                    <div className="md:col-span-1 flex items-end justify-center pb-1">
                                        {medicines.length > 1 ? (
                                            <button
                                                onClick={() => removeMedicine(index)}
                                                title="Remove medicine"
                                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <div className="w-9 h-9" />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {medicines.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-3xl">
                                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                                        <Pill className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h4 className="text-gray-700 font-bold">No Medicines Added</h4>
                                    <p className="text-gray-400 text-sm mt-1 max-w-[200px] mx-auto">Click "Add Medicine" to begin prescribing.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Legend */}
                        <div className="p-6 bg-gray-50/60 border-t border-gray-100">
                            <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600 leading-relaxed">
                                    <strong className="text-blue-600 block mb-1">Dose Frequency Legend:</strong>
                                    Digital prescriptions will automatically include timing instructions for the patient.{' '}
                                    <code className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">1-0-1</code> means Morning &amp; Night.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
