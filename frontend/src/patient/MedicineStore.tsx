import { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Truck,
  Clock,
  Shield,
  Upload,
  Bookmark,
  BookMarked,
  Camera,
  FileText,
  X,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Badge } from '../common/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { toast } from 'sonner';
import { ImageWithFallback } from "../public/figma/ImageWithFallback";
import { medicineService } from '../services/medicineService';
import { patientService } from '../services/patientService';
import { Tabs, TabsList, TabsTrigger } from '../common/ui/tabs';
import type { PatientPage } from './PatientPortal';

export function MedicineStore({ onNavigate }: { onNavigate?: (page: PatientPage) => void }) {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [savedMedicines, setSavedMedicines] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchMedicines();
    } else {
      fetchSavedMedicinesList();
    }
    fetchCart();
    fetchBookmarks();
  }, [category, searchQuery, activeTab]);


  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getMedicines({
        category: category === 'All' ? undefined : category,
        search: searchQuery || undefined
      });
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedMedicinesList = async () => {
    try {
      setLoading(true);
      const data = await patientService.getSavedMedicines();
      const medsList = data.map((item: any) => item.medicine).filter(Boolean);
      setSavedMedicines(medsList);
    } catch (error) {
      console.error('Error fetching saved medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await medicineService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const data = await patientService.getSavedMedicines();
      setBookmarks(data.map((b: any) => b.medicine_id));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'all') {
      fetchMedicines();
    } else {
      fetchSavedMedicinesList();
    }
  };

  const handleAddToCart = async (medicineId: string) => {
    try {
      await medicineService.addToCart(medicineId, 1);
      fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleToggleBookmark = async (medicineId: string) => {
    try {
      await patientService.toggleSaveMedicine(medicineId);
      fetchBookmarks();
      if (activeTab === 'saved') {
        fetchSavedMedicinesList();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const getCartQuantity = (medicineId: string) => {
    const item = cart.find(c => c.medicine_id === medicineId);
    return item?.quantity || 0;
  };

  const handleScanPrescription = async (type: 'upload' | 'camera') => {
    if (type === 'upload') {
      fileInputRef.current?.click();
    } else {
      startCamera();
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUri = canvas.toDataURL('image/jpeg');
      stopCamera();
      processScan(dataUri);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processScan(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processScan = async (dataUri: string) => {
    const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
    setIsScanning(true);
    setScanResult([]);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API}/ai/scan-prescription`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ fileDataUri: dataUri })
      });
      
      const result = await response.json();
      if (result.success && result.data.medicines) {
        setScanResult(result.data.medicines.length > 0 ? result.data.medicines : ['No medicines detected']);
        if (result.data.medicines.length > 0) {
          toast.success(`${result.data.medicines.length} medicines detected!`);
        }
      } else {
        toast.error('Scan failed');
        setScanResult(['No medicines detected']);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Network error during scan');
    } finally {
      setIsScanning(false);
    }
  };


  const handleQuickAdd = async (medicineName: string) => {
    try {
      // Find medicine by name
      const med = medicines.find(m => m.medicine_name?.toLowerCase() === medicineName.toLowerCase());
      if (med) {
        await handleAddToCart(med.medicine_id);
        toast.success(`${medicineName} added to cart`);
      } else {
        setSearchQuery(medicineName);
        toast.error(`${medicineName} not found in store. Searching...`);
      }
    } catch (error) {
      console.error('Error in quick add:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900 mb-1">Buy Medicine</h1>
          <p className="text-sm text-gray-600">Order medicines from our clinic with doorstep delivery</p>
        </div>
        <Button
          onClick={() => onNavigate && onNavigate('cart')}
          className="bg-pink-600 hover:bg-pink-700 relative text-white"
        >
          <ShoppingCart className="size-5 mr-2" />
          View Cart
          {cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 size-6 flex items-center justify-center p-0 bg-purple-600">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </Badge>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="all">Shop Medicines</TabsTrigger>
          <TabsTrigger value="saved">Wishlist</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Features Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-pink-600 rounded-lg">
              <Truck className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-pink-900">Free Delivery</p>
              <p className="text-xs text-pink-700">On orders above ₹500</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Clock className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Fast Delivery</p>
              <p className="text-xs text-purple-700">Delivered in 24-48 hours</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Shield className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">100% Authentic</p>
              <p className="text-xs text-indigo-700">Genuine medicines only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search medicines by name, company, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={(val) => setCategory(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Pain Relief">Pain Relief</SelectItem>
            <SelectItem value="Diabetes">Diabetes</SelectItem>
            <SelectItem value="Allergy">Allergy</SelectItem>
            <SelectItem value="Vitamins">Vitamins</SelectItem>
            <SelectItem value="Antibiotic">Antibiotic</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'saved' && savedMedicines.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              <BookMarked className="size-12 mx-auto mb-4 opacity-50 text-pink-600" />
              <p className="text-lg">Your wishlist is empty.</p>
              <p className="text-sm text-gray-400">Save medicines to purchase them later.</p>
            </div>
          ) : (activeTab === 'all' ? medicines : savedMedicines).map((medicine) => {
            const quantity = getCartQuantity(medicine.medicine_id);
            const isBookmarked = bookmarks.includes(medicine.medicine_id);

            return (
              <Card key={medicine.medicine_id} className="overflow-hidden hover:shadow-lg transition-shadow border-pink-100">
                <div className="aspect-video bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt={medicine.medicine_name}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-pink-600"
                    onClick={() => handleToggleBookmark(medicine.medicine_id)}
                  >
                    {isBookmarked ? <BookMarked className="size-5" /> : <Bookmark className="size-5" />}
                  </Button>
                  {medicine.category && (
                    <Badge className="absolute top-2 left-2 bg-purple-600">
                      {medicine.category}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 mb-1">{medicine.medicine_name}</h3>
                    <p className="text-xs text-gray-600">{medicine.manufacturer || 'Generic'}</p>
                    <p className="text-xs text-gray-500">{medicine.clinic?.clinic_name}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-semibold text-gray-900 text-lg">₹{medicine.mrp}</span>
                    {medicine.stock_quantity <= 5 && medicine.stock_quantity > 0 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                        Only {medicine.stock_quantity} left
                      </Badge>
                    )}
                  </div>

                  {medicine.stock_quantity > 0 ? (
                    <Button
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                      onClick={() => handleAddToCart(medicine.medicine_id)}
                    >
                      <ShoppingCart className="size-4 mr-2" />
                      {quantity > 0 ? `Added (${quantity})` : 'Add to Cart'}
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="w-full justify-center py-2 bg-gray-100 text-gray-500">
                      Out of Stock
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Prescription Scan Feature */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <FileText className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Scan Prescription</h3>
                <p className="text-sm text-blue-700">Quickly add medicines by scanning your prescription image</p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 md:flex-none border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => handleScanPrescription('upload')}
              >
                <Upload className="size-4 mr-2" />
                Upload Image
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 md:flex-none border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => handleScanPrescription('camera')}
              >
                <Camera className="size-4 mr-2" />
                Capture Image
              </Button>
            </div>
          </div>

          {isScanning && (
            <div className="mt-6 flex flex-col items-center justify-center p-8 bg-white/50 rounded-xl border border-blue-100 dashed animate-pulse">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm font-medium text-blue-800">Analyzing prescription using AI OCR...</p>
              <p className="text-xs text-blue-600">Extracting medicine names and dosages</p>
            </div>
          )}

          {!isScanning && scanResult.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Detected Medicines:</p>
                <Button variant="ghost" size="sm" onClick={() => setScanResult([])} className="h-7 text-xs text-gray-500 hover:text-red-500">
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {scanResult.map((med, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className={`px-3 py-1 text-sm ${med === 'No medicines detected' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700 border-green-100'}`}
                  >
                    {med}
                    {med !== 'No medicines detected' ? (
                      <div className="flex items-center gap-1 ml-2 border-l pl-2 border-green-200">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-5 p-0 h-auto hover:bg-green-100 text-green-700"
                          onClick={() => handleQuickAdd(med)}
                          title="Quick Add to Cart"
                        >
                          <ShoppingCart className="size-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-5 p-0 h-auto hover:bg-green-100 text-green-700"
                          onClick={() => setSearchQuery(med)}
                          title="Search in Store"
                        >
                          <Search className="size-3" />
                        </Button>
                      </div>
                    ) : null}
                  </Badge>
                ))}
              </div>
              {scanResult[0] === 'No medicines detected' && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                  <AlertCircle className="size-3" />
                  Try again with better lighting and a clearer image of the prescription.
                </div>
              )}
              {scanResult[0] !== 'No medicines detected' && (
                <p className="text-xs text-gray-500 mt-3 italic">
                  * Click the search icon next to medicine to find it in store.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Capture Prescription</h3>
              <Button variant="ghost" size="icon" onClick={stopCamera}>
                <X className="size-5" />
              </Button>
            </div>
            <div className="aspect-[3/4] bg-black relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 border-2 border-white/50 border-dashed m-12 rounded-xl pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-xs font-medium text-center">
                  Align prescription within frame
                </div>
              </div>
            </div>
            <div className="p-6 flex justify-center bg-gray-50">
              <Button 
                onClick={captureImage}
                size="lg"
                className="rounded-full size-16 p-0 bg-pink-600 hover:bg-pink-700 shadow-xl shadow-pink-200"
              >
                <div className="size-12 rounded-full border-4 border-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

