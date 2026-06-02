import { useState, useEffect } from 'react';
import { 
    FlaskConical, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Clock, 
    DollarSign, 
    Tag,
    Filter,
    Activity,
    Save,
    X,
    ChevronRight,
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
    DialogFooter
} from '../../common/ui/dialog';
import { Label } from '../../common/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '../../common/ui/select';
import labService from '../../services/labService';

export function TestCatalog() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        test_id: null,
        test_name: '',
        category: 'Blood',
        price: '',
        report_time: '24 Hours'
    });

    const categories = ['Blood', 'Radiology', 'Urine', 'MRI', 'CT Scan', 'Pathology'];

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const res = await labService.getInventory();
            if (res.success) {
                setTests(res.data);
            }
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await labService.saveInventory(formData);
            if (res.success) {
                fetchTests();
                setIsAddOpen(false);
                setFormData({ test_id: null, test_name: '', category: 'Blood', price: '', report_time: '24 Hours' });
            }
        } catch (error) {
            console.error('Error saving test:', error);
        }
    };

    const filteredTests = tests.filter(t => 
        t.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Diagnostic Test Management</h1>
                    <p className="text-gray-600 font-medium">Manage your lab's test menu, pricing, and turnaround times</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2"
                            onClick={() => setFormData({ test_id: null, test_name: '', category: 'Blood', price: '', report_time: '24 Hours' })}
                        >
                            <Plus className="w-4 h-4" /> Add New Test
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-blue-600" /> {formData.test_id ? 'Edit Test' : 'Add New Diagnostic Test'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="testName" className="text-right text-xs uppercase font-bold text-gray-400">Test Name</Label>
                                <Input 
                                    id="testName" 
                                    placeholder="e.g. Total Hemoglobin" 
                                    className="col-span-3"
                                    value={formData.test_name}
                                    onChange={(e) => setFormData({...formData, test_name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="testCategory" className="text-right text-xs uppercase font-bold text-gray-400">Category</Label>
                                <Select 
                                    value={formData.category} 
                                    onValueChange={(val) => setFormData({...formData, category: val})}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="testPrice" className="text-right text-xs uppercase font-bold text-gray-400">Price (₹)</Label>
                                <Input 
                                    id="testPrice" 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="col-span-3"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="report_time" className="text-right text-xs uppercase font-bold text-gray-400">TAT</Label>
                                <Select 
                                    value={formData.report_time} 
                                    onValueChange={(val) => setFormData({...formData, report_time: val})}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Report Duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Same Day">Same Day</SelectItem>
                                        <SelectItem value="24 Hours">24 Hours</SelectItem>
                                        <SelectItem value="48 Hours">48 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-gray-500"><X className="w-4 h-4" /> Cancel</Button>
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-lg"
                                onClick={handleSave}
                            >
                                <Save className="w-4 h-4" /> {formData.test_id ? 'Update Test' : 'Save Test'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                        placeholder="Search within test catalog..." 
                        className="pl-10 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2 bg-white shadow-sm">
                        <Filter className="w-4 h-4" /> Category: All
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : filteredTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {filteredTests.map((test) => (
                        <Card key={test.test_id} className="group hover:shadow-xl transition-all border-l-4 border-l-blue-600 overflow-hidden text-left relative bg-white">
                             <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between bg-gray-50/30">
                                 <div className={`p-2 rounded-lg ${test.category === 'Radiology' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                     <FlaskConical className="w-5 h-5 shadow-sm" />
                                 </div>
                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                        className="p-2 hover:bg-white bg-white/50 border shadow-sm rounded-full text-blue-600 transition-colors"
                                        onClick={() => {
                                            setFormData({
                                                test_id: test.test_id,
                                                test_name: test.test_name,
                                                category: test.category,
                                                price: test.price.toString(),
                                                report_time: test.report_time
                                            });
                                            setIsAddOpen(true);
                                        }}
                                     >
                                        <Edit2 className="w-4 h-4" />
                                     </button>
                                     <button className="p-2 hover:bg-red-50 bg-white/50 border shadow-sm rounded-full text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             </CardHeader>
                             <CardContent className="p-5 pt-3 space-y-4">
                                 <div>
                                     <h3 className="font-bold text-gray-900 leading-tight mb-1">{test.test_name}</h3>
                                     <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold tracking-wide uppercase">
                                         <Tag className="w-3 h-3" /> {test.category}
                                     </div>
                                 </div>

                                 <div className="flex items-center justify-between pt-2 border-t border-dashed">
                                     <div className="flex items-center gap-4">
                                         <div className="flex flex-col">
                                             <p className="text-[10px] items-center gap-1 font-bold text-gray-400 uppercase tracking-widest flex"><Clock className="w-3 h-3" /> Report TAT</p>
                                             <p className="text-sm font-black text-gray-700">{test.report_time}</p>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <p className="text-[10px] justify-end font-bold items-center gap-1 text-gray-400 uppercase tracking-widest flex"><DollarSign className="w-3 h-3" /> Price</p>
                                         <p className="text-xl font-black text-blue-600 italic leading-none">₹{parseFloat(test.price).toLocaleString()}</p>
                                     </div>
                                 </div>
                             </CardContent>
                             <div className="p-3 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Active</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold uppercase tracking-widest text-blue-600 p-0 hover:bg-transparent">
                                    View Analytics <ChevronRight className="w-3 h-3" />
                                </Button>
                             </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 italic">Test Catalog Empty</h3>
                    <p className="text-gray-500">Click 'Add New Test' to start building your diagnostic menu.</p>
                </div>
            )}
        </div>
    );
}

