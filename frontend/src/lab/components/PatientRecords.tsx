import { useState, useEffect } from 'react';
import { 
    Search, 
    History, 
    FileText, 
    MoreVertical, 
    Calendar, 
    Phone, 
    Mail, 
    ArrowRight,
    SearchCheck,
    ChevronRight,
    Users,
    Activity,
    User
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../common/ui/dialog';
import { Badge } from '../../common/ui/badge';
import labService from '../../services/labService';

export function PatientRecords() {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await labService.getBookings();
            if (res.success) {
                // Extract unique patients from bookings
                const patientMap = new Map();
                res.data.forEach((booking: any) => {
                    if (!patientMap.has(booking.patient_id)) {
                        patientMap.set(booking.patient_id, {
                            id: booking.patient_id,
                            name: booking.patient_name,
                            age: booking.patient_age,
                            gender: booking.patient_gender || 'N/A',
                            contact: booking.patient_phone || 'N/A',
                            email: booking.patient_email || 'N/A',
                            last_visit: new Date(booking.created_at).toLocaleDateString(),
                            total_tests: 1,
                            tests: [{
                                id: booking.order_id,
                                name: booking.test_name,
                                date: new Date(booking.created_at).toLocaleDateString(),
                                status: booking.status
                            }]
                        });
                    } else {
                        const p = patientMap.get(booking.patient_id);
                        p.total_tests += 1;
                        p.tests.push({
                            id: booking.order_id,
                            name: booking.test_name,
                            date: new Date(booking.created_at).toLocaleDateString(),
                            status: booking.status
                        });
                        // Update last visit if this booking is newer
                        if (new Date(booking.created_at) > new Date(p.last_visit)) {
                            p.last_visit = new Date(booking.created_at).toLocaleDateString();
                        }
                    }
                });
                setPatients(Array.from(patientMap.values()));
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id?.toString().includes(searchTerm) ||
        p.contact?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 italic">Patient Electronic Health Records</h1>
                    <p className="text-gray-600 font-medium">Search and access patient diagnostic history and previous records</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2 bg-white">
                         Download Directory
                    </Button>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 font-bold" />
                    <Input 
                        placeholder="Enter Patient ID, Name, or Phone..." 
                        className="pl-10 h-12 shadow-sm border-blue-100 bg-white" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-8 h-12 shadow-md">
                    <SearchCheck className="w-4 h-4" /> Global Search
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <Card key={patient.id} className="group hover:shadow-xl transition-all border-t-4 border-t-white hover:border-t-blue-600 overflow-hidden text-left relative bg-white">
                                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest italic">
                                        <span>Patient Archive</span>
                                        <span className="text-blue-600">• PID-{patient.id}</span>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                                </CardHeader>
                                <CardContent className="p-5 pt-3 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-black text-xl shadow-inner border border-blue-100 shrink-0 capitalize">
                                            {patient.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase truncate">{patient.name}</h3>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold tracking-wide uppercase italic mt-0.5">
                                                <Users className="w-3 h-3" /> {patient.gender} • {patient.age || 'N/A'} years
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 py-2 border-y border-dashed mt-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <div className="p-1 rounded bg-gray-100"><Phone className="w-3 h-3 text-blue-500" /></div>
                                            <span className="font-bold">{patient.contact}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <div className="p-1 rounded bg-gray-100"><Mail className="w-3 h-3 text-blue-500" /></div>
                                            <span className="truncate italic text-xs">{patient.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] items-center gap-1 font-bold text-gray-400 uppercase tracking-widest flex"><History className="w-3 h-3" /> Recent Activity</p>
                                            <p className="text-sm font-black text-gray-700 italic">{patient.last_visit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] justify-end font-bold items-center gap-1 text-gray-400 uppercase tracking-widest flex"><FileText className="w-3 h-3" /> Record Count</p>
                                            <p className="text-xl font-black text-blue-600 italic leading-none">{patient.total_tests}</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="w-full bg-gray-900 group-hover:bg-blue-600 text-white rounded-none flex items-center gap-2 h-10 transition-colors font-bold uppercase tracking-widest text-[10px]"
                                            onClick={() => setSelectedPatient(patient)}
                                        >
                                            Access Full Archive <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-white">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold flex items-center gap-2 italic uppercase">
                                                 Patient Archive: {selectedPatient?.name}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-6 pt-4">
                                             <div className="grid grid-cols-2 gap-4 h-fit">
                                                 <div className="p-4 bg-gray-50 rounded-xl border border-dashed text-left space-y-1">
                                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Medical History Context</p>
                                                     <p className="text-sm text-gray-600 italic">Digital archive mapping for patient PID-{selectedPatient?.id}. Total tests registered: {selectedPatient?.total_tests}.</p>
                                                 </div>
                                                 <div className="p-4 bg-gray-50 rounded-xl border border-dashed text-left space-y-1">
                                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Alerts</p>
                                                     <p className="text-sm text-gray-400 font-bold uppercase tracking-wide italic">No critical alerts flagged.</p>
                                                 </div>
                                             </div>

                                             <div>
                                                 <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2 mb-3">
                                                     <FileText className="w-4 h-4 text-blue-600" /> Diagnostic History Pipeline
                                                 </h4>
                                                 <div className="space-y-2">
                                                     {selectedPatient?.tests.map((test: any, idx: number) => (
                                                         <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl hover:border-blue-400 transition-colors cursor-pointer group/row">
                                                             <div className="flex items-center gap-3">
                                                                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover/row:bg-blue-600 group-hover/row:text-white transition-colors">
                                                                     <FileText className="w-5 h-5" />
                                                                 </div>
                                                                 <div className="text-left">
                                                                     <p className="text-sm font-black text-gray-800 uppercase italic leading-none mb-1">{test.name}</p>
                                                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> {test.date} • <Badge variant="outline" className="h-4 p-0 px-1.5 text-[8px] uppercase tracking-tighter">{test.status}</Badge></p>
                                                                 </div>
                                                             </div>
                                                             <Button variant="ghost" size="sm" className="text-blue-600 font-bold h-8"><ArrowRight className="w-4 h-4" /></Button>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                             <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                             <h3 className="text-lg font-bold text-gray-900 italic">No patient archival data found</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

