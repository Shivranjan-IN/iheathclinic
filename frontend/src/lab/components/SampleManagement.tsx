import { useState, useEffect } from 'react';
import { 
    Activity, 
    Truck, 
    UserPlus, 
    BadgeCheck, 
    Clock, 
    Search, 
    MoreVertical,
    Droplet,
    Home,
    Navigation,
    CheckCircle2,
    Play,
    Pause,
    RotateCcw,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '../../common/ui/dialog';
import labService from '../../services/labService';

export function SampleManagement() {
    const [samples, setSamples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Bulk task selection states
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [selectedTechId, setSelectedTechId] = useState<string>('');
    const [assigning, setAssigning] = useState(false);

    // Live Map Modal states
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [trackingTech, setTrackingTech] = useState<any>(null);
    const [mapProgress, setMapProgress] = useState(0); // 0 to 100
    const [isPlaying, setIsPlaying] = useState(false);
    
    useEffect(() => {
        fetchSamples();
        fetchTechnicians();
    }, []);

    // Simulated technician movement interval
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setMapProgress((prev) => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 300);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const fetchSamples = async () => {
        setLoading(true);
        try {
            const res = await labService.getBookings({ all: true });
            if (res.success) {
                // Filter for samples/bookings that are not yet Completed
                const activeSamples = (res.bookings || []).filter((s: any) => s.status !== 'Completed');
                setSamples(activeSamples);
            }
        } catch (error) {
            console.error('Error fetching samples:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const res = await labService.getStaff({ role: 'Technician' });
            if (res.success) {
                setTechnicians(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    };

    const handleCheckboxChange = (orderId: string) => {
        setSelectedOrders(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId) 
                : [...prev, orderId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedOrders(filteredSamples.map(s => s.lab_order_id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleBulkAssign = async () => {
        if (!selectedTechId || selectedOrders.length === 0) return;
        setAssigning(true);
        try {
            const res = await labService.bulkAssignTechnicians(selectedOrders, parseInt(selectedTechId));
            if (res.success) {
                alert(`Successfully assigned ${selectedOrders.length} bookings to technician.`);
                setSelectedOrders([]);
                setSelectedTechId('');
                setIsAssignModalOpen(false);
                fetchSamples();
            }
        } catch (error) {
            console.error('Error bulk assigning tasks:', error);
            alert('Failed to assign bulk tasks. Check database schema updates.');
        } finally {
            setAssigning(false);
        }
    };

    const openMapModal = (sample?: any) => {
        // Set a default tech or the one assigned to the selected sample
        const tech = sample?.technician || technicians[0] || { full_name: 'Priya Sharma', phone: '+91 99999 12345' };
        setTrackingTech(tech);
        setMapProgress(sample?.status === 'Sample Collected' ? 80 : sample?.status === 'Processing' ? 40 : 10);
        setIsPlaying(false);
        setIsMapModalOpen(true);
    };

    const filteredSamples = samples.filter(s => 
        s.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lab_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lab_order_items?.some((i: any) => i.lab_test_types?.test_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'orange';
            case 'accepted': return 'blue';
            case 'processing': return 'purple';
            case 'sample collected': return 'indigo';
            case 'completed': return 'green';
            default: return 'gray';
        }
    };

    // Calculate map position coordinates based on progress (0-100)
    const getTechCoordinates = () => {
        // SVG size is 400x250. Route connects Lab (50, 200) -> Patient A (180, 80) -> Patient B (320, 140) -> Lab (50, 200)
        let x = 50, y = 200;
        if (mapProgress <= 40) {
            // Lab to Patient A
            const pct = mapProgress / 40;
            x = 50 + (180 - 50) * pct;
            y = 200 + (80 - 200) * pct;
        } else if (mapProgress <= 80) {
            // Patient A to Patient B
            const pct = (mapProgress - 40) / 40;
            x = 180 + (320 - 180) * pct;
            y = 80 + (140 - 80) * pct;
        } else {
            // Patient B back to Lab
            const pct = (mapProgress - 80) / 20;
            x = 320 + (50 - 320) * pct;
            y = 140 + (200 - 140) * pct;
        }
        return { x, y };
    };

    const techPos = getTechCoordinates();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900">Sample Collection Management</h1>
                    <p className="text-gray-600 font-medium">Track sample statuses and assign technicians for home collection</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => selectedOrders.length > 0 ? setIsAssignModalOpen(true) : alert('Please select at least one sample row.')}
                        disabled={selectedOrders.length === 0}
                        className={`flex items-center gap-2 h-11 border-blue-100 rounded-xl transition-all shadow-md font-semibold text-xs uppercase px-4 ${selectedOrders.length > 0 ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-gray-50 text-gray-400'}`}
                    >
                         Assign Bulk Tasks {selectedOrders.length > 0 && `(${selectedOrders.length})`}
                    </Button>
                    <Button 
                        onClick={() => openMapModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 h-11 rounded-xl font-bold text-xs uppercase px-4 active:scale-95 transition-transform"
                    >
                        <Truck className="w-4 h-4" /> Home Collection Map
                    </Button>
                </div>
            </div>

            {/* Dashboard metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Pending Collections', count: samples.filter(s => s.status === 'Pending').length, icon: Clock, color: 'orange' },
                    { label: 'Collected Samples', count: samples.filter(s => s.status === 'Sample Collected').length, icon: BadgeCheck, color: 'indigo' },
                    { label: 'Samples In Process', count: samples.filter(s => s.status === 'Processing').length, icon: Activity, color: 'purple' },
                    { label: 'Home Collection Req', count: samples.filter(s => s.collection_type === 'Home' || s.collection_type === null).length, icon: Home, color: 'blue' },
                ].map((state, idx) => (
                    <Card key={idx} className="bg-white hover:shadow-md transition-all group overflow-hidden border-b-4 border-b-gray-100 hover:border-b-blue-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{state.label}</p>
                                <h3 className="text-2xl font-black text-gray-900 leading-none">{state.count}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl bg-${state.color}-50 group-hover:scale-110 transition-transform`}>
                                <state.icon className={`w-5 h-5 text-${state.color}-600`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main grid */}
            <Card className="shadow-lg border-blue-50 bg-white">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                     <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200"><Droplet className="w-5 h-5" /></div>
                          <CardTitle className="text-lg">Live Sample Pipeline</CardTitle>
                      </div>
                      <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 font-bold" />
                          <Input 
                             placeholder="Filter pipeline..." 
                             className="pl-10 h-10 shadow-sm"
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto text-left">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredSamples.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-b text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 w-12 text-center">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                checked={selectedOrders.length === filteredSamples.length && filteredSamples.length > 0}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                        </th>
                                        <th className="px-6 py-4">Sample ID</th>
                                        <th className="px-6 py-4">Patient Details</th>
                                        <th className="px-6 py-4">Test Description</th>
                                        <th className="px-6 py-4">Collection Type</th>
                                        <th className="px-6 py-4">Current Status</th>
                                        <th className="px-6 py-4">Assigned Tech</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-left bg-white">
                                    {filteredSamples.map((sample) => {
                                        const isSelected = selectedOrders.includes(sample.lab_order_id);
                                        return (
                                            <tr key={sample.lab_order_id} className={`transition-colors ${isSelected ? 'bg-blue-50/20' : 'hover:bg-blue-50/50'}`}>
                                                <td className="px-6 py-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                        checked={isSelected}
                                                        onChange={() => handleCheckboxChange(sample.lab_order_id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4"><Badge className="bg-slate-900 border-none font-bold font-mono">SMP-{sample.lab_order_id.replace('LAB-','')}</Badge></td>
                                                <td className="px-6 py-4 font-semibold text-gray-900 uppercase text-xs">
                                                    {sample.patient?.full_name || 'N/A'} <span className="text-gray-400 font-normal">({sample.patient?.age || 'N/A'} {sample.patient?.gender})</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                                                    {sample.lab_order_items?.map((i: any) => i.lab_test_types?.test_name).join(', ') || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sample.collection_type === 'Home' || sample.collection_type === null ? (
                                                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50/50 flex gap-1 items-center w-fit font-black text-[10px] uppercase">
                                                            <Truck className="w-3.5 h-3.5" /> Home Collection
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 font-black text-[10px] uppercase">Walk-in Hub</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full bg-${getStatusColor(sample.status)}-500`} />
                                                        <span className="capitalize font-black text-gray-700 uppercase text-[10px] tracking-widest italic">{sample.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sample.technician ? (
                                                        <div 
                                                            onClick={() => openMapModal(sample)}
                                                            className="flex items-center gap-2 group cursor-pointer hover:text-blue-600"
                                                        >
                                                            <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-[10px] font-black uppercase">{sample.technician.full_name.charAt(0)}</div>
                                                            <span className="font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
                                                                {sample.technician.full_name}
                                                                <Truck className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors animate-pulse" />
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => {
                                                                setSelectedOrders([sample.lab_order_id]);
                                                                setIsAssignModalOpen(true);
                                                            }}
                                                            className="text-blue-600 font-black hover:bg-blue-50 h-8 flex items-center gap-1 uppercase text-[10px] tracking-widest px-2.5 rounded-lg border border-dashed border-blue-200"
                                                        >
                                                            <UserPlus className="w-3.5 h-3.5" /> Assign Tech
                                                        </Button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 group">
                                                        <MoreVertical className="w-4 h-4 group-hover:text-blue-600" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-20">
                                <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-400 italic">No samples in pipeline</h3>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Technicians Selection dialog */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent className="sm:max-w-[400px] text-left">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <UserPlus className="w-5 h-5 text-blue-600" /> Assign Technician
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Select a diagnostic courier to dispatch for the {selectedOrders.length} selected patient collection requests.
                        </p>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Technicians</label>
                            <select 
                                value={selectedTechId} 
                                onChange={(e) => setSelectedTechId(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="">-- Choose Courier/Tech --</option>
                                {technicians.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.full_name} ({t.department || 'Diagnostics'})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => { setIsAssignModalOpen(false); setSelectedTechId(''); }}
                            className="text-xs font-bold uppercase rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleBulkAssign}
                            disabled={!selectedTechId || assigning}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-xl px-5"
                        >
                            {assigning ? 'Dispatching...' : 'Confirm Dispatch'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Live Collection Tracking Map Modal */}
            <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
                <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-slate-900 border-none rounded-3xl text-left shadow-2xl">
                    <div className="flex h-[450px] relative">
                        {/* Map side */}
                        <div className="flex-1 bg-slate-950 p-6 flex flex-col relative justify-between overflow-hidden">
                            <div className="flex items-center justify-between z-10">
                                <div>
                                    <h3 className="font-black text-white uppercase italic text-sm tracking-widest flex items-center gap-1.5 leading-none">
                                        <Navigation className="w-4 h-4 text-blue-500 animate-pulse" /> Live Tracking Node
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Simulated GPS Dispatch Area</p>
                                </div>
                                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                                    COORD: {techPos.x.toFixed(0)}°N, {techPos.y.toFixed(0)}°E
                                </span>
                            </div>

                            {/* SVG Map of Area */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 mt-6">
                                <svg className="w-full h-full max-h-[300px]" viewBox="0 0 400 250">
                                    {/* Grid background */}
                                    <defs>
                                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                        </pattern>
                                    </defs>
                                    <rect width="400" height="250" fill="url(#grid)" />

                                    {/* Roads/Routes */}
                                    <path d="M 50,200 Q 120,150 180,80 T 320,140 Q 200,240 50,200" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                                    <path d="M 50,200 Q 120,150 180,80 T 320,140 Q 200,240 50,200" fill="none" stroke="rgba(37, 99, 235, 0.4)" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />

                                    {/* Patient A Pin (Pulsing ring) */}
                                    <circle cx="180" cy="80" r="10" fill="rgba(249, 115, 22, 0.2)" className="animate-ping" />
                                    <circle cx="180" cy="80" r="4" fill="#f97316" />
                                    
                                    {/* Patient B Pin */}
                                    <circle cx="320" cy="140" r="10" fill="rgba(249, 115, 22, 0.2)" className="animate-ping" />
                                    <circle cx="320" cy="140" r="4" fill="#f97316" />

                                    {/* Lab Hub Pin */}
                                    <circle cx="50" cy="200" r="14" fill="rgba(59, 130, 246, 0.15)" />
                                    <rect x="44" y="194" width="12" height="12" rx="3" fill="#2563eb" />

                                    {/* Labels */}
                                    <text x="50" y="222" fill="#60a5fa" fontSize="8" fontWeight="bold" textAnchor="middle">DIAGNOSTICS LAB</text>
                                    <text x="180" y="65" fill="#f97316" fontSize="8" fontWeight="bold" textAnchor="middle">PATIENT #1</text>
                                    <text x="320" y="125" fill="#f97316" fontSize="8" fontWeight="bold" textAnchor="middle">PATIENT #2</text>

                                    {/* Technician vehicle dot */}
                                    <g transform={`translate(${techPos.x - 7}, ${techPos.y - 7})`}>
                                        <circle cx="7" cy="7" r="8" fill="rgba(168, 85, 247, 0.3)" className="animate-ping" />
                                        <circle cx="7" cy="7" r="5" fill="#a855f7" />
                                    </g>
                                </svg>
                            </div>

                            {/* Control triggers */}
                            <div className="flex justify-between items-center z-10 w-full">
                                <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur border border-slate-800 p-1 rounded-xl shadow-lg">
                                    <button 
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-white transition-colors"
                                        title={isPlaying ? "Pause Simulation" : "Start Simulation"}
                                    >
                                        {isPlaying ? <Pause className="w-3.5 h-3.5 text-orange-400" /> : <Play className="w-3.5 h-3.5 text-green-400" />}
                                    </button>
                                    <button 
                                        onClick={() => { setMapProgress(0); setIsPlaying(false); }}
                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-white transition-colors"
                                        title="Reset"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 bg-slate-900/80 px-3 py-1.5 border border-slate-800 rounded-xl">
                                    PROGRESS: {mapProgress}%
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Info sidebar */}
                        <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col justify-between p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white uppercase text-xs tracking-widest italic">Collection Dispatch Log</h3>
                                <button onClick={() => setIsMapModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"><X className="w-4 h-4" /></button>
                            </div>

                            {/* Tracking Card */}
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center"><Truck className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Diagnostic Courier</p>
                                        <p className="text-xs font-black text-white uppercase mt-1 leading-none">{trackingTech?.full_name}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-400 bg-slate-900/40 p-2 rounded-xl">
                                    <div>
                                        <span className="block text-[8px] text-gray-600 uppercase">CONTACT</span>
                                        <span className="text-white">{trackingTech?.phone || '+91 98765 12345'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] text-gray-600 uppercase">ETA / DISTANCE</span>
                                        <span className="text-blue-400 font-mono uppercase">{mapProgress >= 80 ? 'Returning' : `${Math.ceil((80 - mapProgress) / 5) + 1} mins / ${(1.4 - mapProgress * 0.012).toFixed(1)} km`}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Milestone Lists */}
                            <div className="flex-1 my-6 overflow-y-auto space-y-4 pr-1 text-left custom-scrollbar">
                                {[
                                    { label: 'Technician Dispatched', desc: `Assigned to ${trackingTech?.full_name}`, time: '11:00 AM', done: mapProgress >= 5 },
                                    { label: 'Arrived at Location A', desc: 'Sample collecting at Patient 1', time: '11:15 AM', done: mapProgress >= 40 },
                                    { label: 'Arrived at Location B', desc: 'Sample collecting at Patient 2', time: '11:32 AM', done: mapProgress >= 80 },
                                    { label: 'Samples Deposited', desc: 'Handed over to central laboratory node', time: 'Pending', done: mapProgress >= 100 },
                                ].map((step, idx) => (
                                    <div key={idx} className="flex gap-3 text-left">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                                                step.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-700 bg-slate-900 text-slate-700'
                                            }`}>
                                                {step.done && <CheckCircle2 className="w-3 h-3" />}
                                            </div>
                                            {idx < 3 && <div className={`w-0.5 h-10 ${step.done ? 'bg-green-500/50' : 'bg-slate-800'}`} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[10px] font-black uppercase ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                                                <span className="text-[8px] font-mono text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded-full">{step.time}</span>
                                            </div>
                                            <p className="text-[9px] text-gray-500 font-semibold mt-0.5 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                onClick={() => { setMapProgress(100); setIsPlaying(false); }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest h-11 rounded-xl shadow-lg"
                            >
                                Force Complete Loop
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -40;
                    }
                }
            `}</style>
        </div>
    );
}
