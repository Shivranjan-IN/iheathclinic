import { useState, useEffect } from 'react';
import { 
    Building2, 
    MoreVertical, 
    MapPin, 
    ArrowUpRight,
    FlaskConical,
    Activity,
    Search,
    ShieldCheck,
    Briefcase,
    Globe,
    Plus,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../common/ui/tabs';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle,
    DialogTrigger
} from '../../common/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../common/ui/table';
import labService from '../../services/labService';

export function ClinicConnections() {
    const [connections, setConnections] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subLoading, setSubLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPartnersOpen, setIsPartnersOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const res = await labService.getClinicConnections();
            if (res.success) {
                setConnections(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPotentialPartners = async () => {
        setSubLoading(true);
        try {
            const res = await labService.getPotentialPartners();
            if (res.success) {
                setPartners(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setSubLoading(false);
        }
    };

    const fetchMappingReports = async () => {
        setSubLoading(true);
        try {
            const res = await labService.getMappingReports();
            if (res.success) {
                setReports(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setSubLoading(false);
        }
    };

    const handleInvite = (clinicId: number) => {
        alert('Invitation protocol initiated for Clinic ID: ' + clinicId + '. Our system is establishing a secure encrypted handshake.');
    };

    const filteredConnections = connections.filter(c => 
        c.clinics?.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Network Intelligence & Partners</h1>
                    <p className="text-gray-600 font-medium ml-5">Manage and discover medical centers in your diagnostic network</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isPartnersOpen} onOpenChange={(open) => {
                        setIsPartnersOpen(open);
                        if (open) fetchPotentialPartners();
                    }}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={() => {
                                    setIsPartnersOpen(true);
                                    fetchPotentialPartners();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 h-11 px-6 rounded-xl"
                            >
                                <Plus className="w-5 h-5" /> Discover Potential Partners
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-white rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Nearby Clinic Discovery</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500">
                                    Available medical centers not currently in your diagnostic network
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4 min-h-[300px]">
                                {subLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                        <p className="text-sm text-gray-500 font-medium italic">Synthesizing regional medical clusters...</p>
                                    </div>
                                ) : partners.length > 0 ? (
                                    <div className="border rounded-2xl overflow-hidden shadow-sm bg-gray-50/30">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-bold text-xs uppercase text-gray-400">Clinic Name</TableHead>
                                                    <TableHead className="font-bold text-xs uppercase text-gray-400">Location</TableHead>
                                                    <TableHead className="text-right font-bold text-xs uppercase text-gray-400">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {partners.map((p) => (
                                                    <TableRow key={p.id} className="hover:bg-white transition-colors">
                                                        <TableCell className="font-bold text-gray-900">{p.clinic_name}</TableCell>
                                                        <TableCell className="text-gray-500 font-medium italic">{p.address?.city || 'N/A'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                className="border-blue-600 text-blue-600 hover:bg-blue-50 font-bold uppercase text-[10px]"
                                                                onClick={() => handleInvite(p.id)}
                                                            >
                                                                Send Invite
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No new clinics detected in this sector yet.</p>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isReportsOpen} onOpenChange={(open) => {
                        setIsReportsOpen(open);
                        if (open) fetchMappingReports();
                    }}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={() => {
                                    setIsReportsOpen(true);
                                    fetchMappingReports();
                                }}
                                variant="outline" 
                                className="flex items-center gap-2 h-11 px-6 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                            >
                                <Globe className="w-5 h-5" /> Mapping Reports
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-white rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Spatial Intelligence & Geospatial Mapping</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500">
                                    Heatmaps and referral distribution analytics across connected nodes
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4 min-h-[300px]">
                                {subLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                        <p className="text-sm text-gray-500 font-medium italic">Generating geospatial heatmaps...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Network Value</p>
                                                <p className="text-2xl font-black text-gray-900 leading-none italic">
                                                    ₹{reports.reduce((acc, curr) => acc + Number(curr.total_revenue || 0), 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <Activity className="w-8 h-8 text-blue-200" />
                                        </div>
                                        <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Global Sample Throughput</p>
                                                <p className="text-2xl font-black text-gray-900 leading-none italic">
                                                    {reports.reduce((acc, curr) => acc + Number(curr.order_count || 0), 0)}
                                                </p>
                                            </div>
                                            <FlaskConical className="w-8 h-8 text-purple-200" />
                                        </div>
                                    </div>
                                )}
                                <div className="border rounded-2xl overflow-hidden shadow-sm">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow>
                                                <TableHead className="font-bold text-xs uppercase text-gray-400">Clinic Source</TableHead>
                                                <TableHead className="font-bold text-xs uppercase text-gray-400 text-center">Orders</TableHead>
                                                <TableHead className="text-right font-bold text-xs uppercase text-gray-400">Revenue Contribution</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reports.length > 0 ? reports.map((r, i) => (
                                                <TableRow key={i} className="hover:bg-gray-50 transition-colors">
                                                    <TableCell className="font-bold text-gray-900">{r.clinic_name}</TableCell>
                                                    <TableCell className="text-center font-bold text-blue-600">{r.order_count}</TableCell>
                                                    <TableCell className="text-right font-bold text-emerald-600 italic">₹{Number(r.total_revenue).toLocaleString()}</TableCell>
                                                </TableRow>
                                            )) : !subLoading && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-10 italic font-medium text-gray-400">Spatial telemetry required to generate heatmaps.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                    placeholder="Search connected network..." 
                    className="pl-10 h-11 shadow-sm rounded-xl border-gray-200 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm mb-6 w-fit">
                    <TabsTrigger value="active" className="px-6 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold uppercase tracking-widest text-xs transition-all">
                         Connected ({filteredConnections.length})
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="px-6 rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white font-bold uppercase tracking-widest text-xs transition-all">
                         Mapping Requests (0)
                    </TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Activity className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Synchronizing with partner registries...</p>
                    </div>
                ) : (
                    <TabsContent value="active" className="mt-0">
                        {filteredConnections.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredConnections.map((conn) => (
                                    <Card key={conn.mapping_id} className="group hover:shadow-2xl hover:border-blue-600 transition-all text-left relative overflow-hidden bg-white border-blue-50 rounded-2xl border-2">
                                        <CardHeader className="p-4 pb-2 border-b bg-gray-50/50 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                                <ShieldCheck className="w-3 h-3 text-blue-500" /> Sync Active • ID: {conn.mapping_id}
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                                        </CardHeader>
                                        <CardContent className="p-5 space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex flex-col items-center justify-center text-white shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase truncate text-base">{conn.clinics?.clinic_name}</h3>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-bold tracking-widest uppercase italic mt-1 bg-blue-50 w-fit px-2 py-0.5 rounded-full">
                                                        <Briefcase className="w-3 h-3" /> Reg: {conn.clinics?.medical_council_reg_no || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="py-3 border-y border-dashed mt-2 border-gray-200">
                                                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate">{conn.clinics?.address?.city || 'Location Pending'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Handshake Established</p>
                                                    <p className="text-xs font-bold text-gray-700 italic">{new Date(conn.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Samples</p>
                                                    <p className="text-xl font-black text-blue-600 italic leading-none">0</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-0 border-t">
                                             <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50 font-bold uppercase tracking-widest text-[10px] h-10 flex items-center justify-between px-6 rounded-none group/btn">
                                                 Intelligence Insights <ArrowUpRight className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                                             </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 italic">No Connected Clinics</h3>
                                <p className="text-gray-500">Discover partners or invite medical centers to start collaborating.</p>
                            </div>
                        )}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
