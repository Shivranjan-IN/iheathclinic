import React, { useState } from 'react';
import { 
    Clock, 
    Calendar, 
    Settings, 
    Plus, 
    Trash2, 
    Save, 
    Clock9,
    Briefcase,
    ShieldCheck,
    Coffee,
    Search,
    Edit2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../common/ui/tabs';

export function Scheduling() {
    const [workingHours, setWorkingHours] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [slots, setSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [systemProtection, setSystemProtection] = useState(true);

    React.useEffect(() => {
        import('../../services/labService').then(m => {
            m.default.getScheduling?.().then(res => {
                if (res?.success) {
                    setWorkingHours(res.data.workingHours || []);
                    setHolidays(res.data.holidays || []);
                    setSlots(res.data.slots || []);
                }
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, []);

    const handleSaveGlobal = () => {
        import('../../services/labService').then(m => {
            m.default.updateScheduling?.({ workingHours, holidays, slots }).then(res => {
                if (res?.success) alert("Successfully merged scheduling changes with system engine.");
            });
        });
    };

    const handleEditShift = (idx: number) => {
        const newOpen = prompt("Enter new open time (e.g. 09:00 AM) or 'Closed':", workingHours[idx].openTime);
        if (newOpen !== null) {
            const newClose = prompt("Enter new close time (e.g. 05:00 PM) or 'Closed':", workingHours[idx].closeTime);
            if (newClose !== null) {
                const updated = [...workingHours];
                updated[idx].openTime = newOpen;
                updated[idx].closeTime = newClose;
                updated[idx].isOpen = newOpen.toLowerCase() !== 'closed';
                setWorkingHours(updated);
            }
        }
    };

    const handleAddSlot = () => {
        const newSlot = prompt("Enter new slot time (e.g. 02:00 PM):");
        if (newSlot) setSlots([...slots, newSlot].sort());
    };

    const handleRemoveSlot = (slotToRemove: string) => {
        setSlots(slots.filter(s => s !== slotToRemove));
    };

    const handleAddHoliday = () => {
        const details = prompt("Enter exception details separated by comma (YYYY-MM-DD, Holiday Name):");
        if (details && details.includes(',')) {
            const [date, name] = details.split(',');
            setHolidays([...holidays, { id: Date.now(), date: date.trim(), name: name.trim(), type: 'Public Holiday' }]);
        }
    };

    const handleRemoveHoliday = (id: number) => {
        setHolidays(holidays.filter(h => h.id !== id));
    };

    if (loading) return <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest">Initializing Scheduling Engine...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight italic">Operations & Scheduling</h1>
                    <p className="text-gray-600 font-medium italic mb-2">Configure lab operational hours, slot availability, and technical staff shifts</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSaveGlobal} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 h-11 px-8 rounded-xl shadow-blue-100 transition-all active:scale-95">
                        <Save className="w-4 h-4" /> Save Global Configuration
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* Working Hours Sidebar */}
                <Card className="lg:col-span-1 shadow-2xl border-blue-50/50 overflow-hidden divide-y rounded-3xl group">
                    <CardHeader className="bg-gray-900 p-6 grow-0 flex flex-row items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-900/50"><Clock9 className="w-5 h-5 shadow-inner" /></div>
                             <CardTitle className="text-lg text-white font-black uppercase tracking-widest italic">Facility Hours</CardTitle>
                         </div>
                         <button className="text-gray-400 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
                    </CardHeader>
                    <CardContent className="p-4 bg-white grow flex flex-col gap-1.5 pt-6">
                        {workingHours.map((day, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3.5 rounded-2xl border border-transparent transition-all group/item cursor-pointer hover:border-blue-100 ${day.isOpen ? 'hover:bg-blue-50/30' : 'bg-gray-50/50 opacity-60'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full transform scale-0 group-hover/item:scale-110 transition-transform ${day.isOpen ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <span className={`font-black uppercase tracking-widest text-xs italic ${day.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>{day.day}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-0.5">{day.isOpen ? 'Active Shift' : 'Facility System'}</p>
                                         <p className={`text-xs font-black italic tracking-wider ${day.isOpen ? 'text-blue-600' : 'text-gray-400 uppercase'}`}>{day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'CLOSED'}</p>
                                    </div>
                                    <button onClick={() => handleEditShift(idx)} className="p-1 hover:bg-white rounded transition-colors border-transparent border hover:border-blue-100 group-hover/item:text-blue-600 text-gray-300"><Edit2 className="w-3 h-3" /></button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter 
                        className="p-4 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setSystemProtection(!systemProtection)}
                    >
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${systemProtection ? 'bg-green-50 border-green-200 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-red-50 border-red-200 shadow-inner'}`}>
                            <ShieldCheck className={`w-4 h-4 ${systemProtection ? 'text-green-500' : 'text-red-500'}`} />
                            <p className={`text-[10px] font-black uppercase tracking-widest ${systemProtection ? 'text-green-700' : 'text-red-700'}`}>
                                {systemProtection ? 'System Protection: Active' : 'Protection Disabled'}
                            </p>
                            <div className={`w-8 h-4 shrink-0 rounded-full flex items-center p-0.5 transition-colors duration-300 ${systemProtection ? 'bg-green-500' : 'bg-red-300'}`}>
                                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${systemProtection ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* Main Schedule Content */}
                <Card className="lg:col-span-2 shadow-2xl border-blue-50/50 rounded-3xl overflow-hidden bg-white">
                    <Tabs defaultValue="slots" className="w-full">
                        <TabsList className="bg-gray-50/50 w-full p-6 h-fit flex items-center justify-start gap-8 rounded-none border-b shadow-inner">
                            <TabsTrigger value="slots" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-2 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all">
                                <Briefcase className="w-4 h-4" /> Lab Booking Slots
                            </TabsTrigger>
                            <TabsTrigger value="holidays" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-2 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all">
                                <Coffee className="w-4 h-4" /> Holiday Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="slots" className="p-8 mt-0 space-y-8 animate-in fade-in duration-500">
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                 <div>
                                     <h3 className="font-black text-xl italic uppercase text-gray-900 tracking-tight">Daily Sample Collection Capacity</h3>
                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic leading-none mt-1">Configure individual time-block availability for appointments</p>
                                 </div>
                                 <Button onClick={handleAddSlot} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2 transform active:scale-95 transition-all text-xs font-bold uppercase py-5 px-6">
                                     <Plus className="w-4 h-4" /> Add Bulk Slots
                                 </Button>
                             </div>

                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                 {slots.map((time, idx) => (
                                     <div key={idx} className="group relative transition-all cursor-pointer">
                                         <div className="p-5 border-2 border-dashed border-gray-100 rounded-3xl hover:border-blue-500 hover:bg-blue-50/30 transition-all text-center group-hover:scale-105 relative overflow-hidden">
                                             <p className="text-lg font-black text-gray-900 italic transform group-hover:-translate-y-1 transition-transform">{time}</p>
                                             <div className="flex items-center justify-center gap-1.5 mt-2 opacity-100 group-hover:opacity-10 transition-opacity">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available</span>
                                             </div>
                                             <div 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newTime = prompt("Change block interval format:", time);
                                                    if (newTime) {
                                                        const updatedSlots = [...slots];
                                                        updatedSlots[idx] = newTime;
                                                        setSlots(updatedSlots);
                                                    }
                                                }}
                                                className="absolute w-full h-full inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 backdrop-blur-sm bg-blue-50/20"
                                             >
                                                 <p className="text-xs font-black uppercase tracking-tight text-blue-600 items-center flex gap-1 bg-white px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.15)] border border-blue-100"><Edit2 className="w-3 h-3" /> Edit Slot</p>
                                             </div>
                                         </div>
                                         <button onClick={() => handleRemoveSlot(time)} className="absolute -top-1 -right-1 bg-white shadow-md border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 className="w-3 h-3 text-red-500" /></button>
                                     </div>
                                 ))}
                             </div>
                        </TabsContent>

                        <TabsContent value="holidays" className="p-8 mt-0 animate-in slide-in-from-right duration-500 h-full">
                            <div className="flex flex-col h-full space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-black text-xl italic uppercase text-gray-900 tracking-tight">Active Blackout Dates</h3>
                                    <div className="relative w-48">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                                        <Input placeholder="Search exceptions..." className="pl-8 h-8 text-[10px] font-bold uppercase p-0 border-none bg-gray-50 rounded-lg shadow-inner" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {holidays.map(holiday => (
                                        <div key={holiday.id} className="p-5 rounded-3xl bg-gray-50/50 border border-transparent hover:border-blue-100 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white border shadow-md shadow-gray-200/50 flex flex-col items-center justify-center overflow-hidden">
                                                    <div className="bg-red-500 w-full h-4" />
                                                    <p className="text-lg font-black text-gray-900 leading-none mt-1">{holiday.date.split('-')[2]}</p>
                                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mt-0.5">April</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 uppercase italic tracking-tight text-lg">{holiday.name}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3 text-orange-400" /> Full Facility Blackout</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge className="bg-white text-gray-800 border-gray-200 border uppercase font-black text-[9px] tracking-widest rounded-xl px-4 py-1.5 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all cursor-pointer">{holiday.type}</Badge>
                                                <button onClick={() => handleRemoveHoliday(holiday.id)} className="p-2.5 hover:bg-white rounded-2xl border border-transparent hover:border-red-100 text-gray-300 hover:text-red-500 transition-all shadow-none hover:shadow-xl"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div onClick={handleAddHoliday} className="p-10 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all group/add">
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-xl group-hover/add:scale-110 transition-all duration-500 border-4 border-white"><Calendar className="w-8 h-8" /></div>
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Add New Facility Exception</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}


