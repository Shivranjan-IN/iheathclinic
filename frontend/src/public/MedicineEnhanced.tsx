import React, { useState, useRef, useEffect } from "react";
import { Button } from "../common/ui/button";
import { Input } from "../common/ui/input";
import { Card } from "../common/ui/card";
import { Badge } from "../common/ui/badge";
import { Navigation } from "../common/Navigation";
import { Footer } from "../common/Footer";
import { useCart } from "../contexts/CartContext";
import {
  Search, Upload, ShoppingCart, Filter, Star, Pill,
  Heart, TrendingUp, Clock, CheckCircle, X,
  FileText, Zap, ShieldCheck
} from "lucide-react";
import type { PageView } from "../common/types";
import api from "../lib/api";

interface MedicineEnhancedProps {
  onNavigate: (view: PageView) => void;
  user: any;
  onLoginRequired: () => void;
}

export function MedicineEnhanced({ onNavigate, user, onLoginRequired }: MedicineEnhancedProps) {
  const { addToCart, getItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedMedicines, setExtractedMedicines] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dbMedicines, setDbMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Removed the mandatory redirect for viewing. We will just enforce login on checkout/add-to-cart.

  // Fetch true medicines from database
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/medicines');
        const medData = Array.isArray(response) ? response : (response.data || []);
        
        // Map backend schema to frontend representation
        const mappedMedicines = (Array.isArray(medData) ? medData : []).map((med: any) => ({
          id: med.medicine_id || Math.random().toString(),
          name: med.medicine_name || 'Unknown Medicine',
          genericName: med.composition || med.description || 'Generic',
          manufacturer: med.manufacturer || 'General Pharma',
          price: med.price || med.cost || 50,
          mrp: (med.price || med.cost || 50) + 10,
          category: med.category?.toLowerCase() || 'fever',
          rating: 4.5,
          reviews: Math.floor(Math.random() * 500) + 50,
          stock: (med.stock_quantity > 0 || med.stock > 0) ? "In Stock" : "Available",
          prescriptionRequired: med.prescription_required === true,
          image: "💊",
          benefits: med.category ? [med.category] : ["Health", "Wellness"],
          pack: med.pack_size || "1 Strip"
        }));
        
        setDbMedicines(mappedMedicines);
      } catch (error) {
        console.error("Failed to fetch medicines from DB:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, [user]);

  const categories = [
    { id: "all", name: "All Medicines", icon: <Pill /> },
    { id: "fever", name: "Fever & Pain", icon: "🌡️" },
    { id: "cold", name: "Cold & Cough", icon: "🤧" },
    { id: "digestive", name: "Digestive", icon: "🍽️" },
    { id: "vitamins", name: "Vitamins", icon: "💊" },
    { id: "chronic", name: "Chronic Care", icon: "❤️‍🩹" },
  ];

  const filteredMedicines = dbMedicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
    const matchesExtracted = extractedMedicines.length === 0 ||
      extractedMedicines.some(extracted =>
        med.name.toLowerCase().includes(extracted.toLowerCase()) ||
        med.genericName.toLowerCase().includes(extracted.toLowerCase())
      );
    return matchesSearch && matchesCategory && matchesExtracted;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      processOCR(file);
    }
  };

  // Mock OCR processing - In real app, use Tesseract.js or backend API
  const processOCR = async (_file: File) => {
    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      // Mock extracted medicine names
      const mockExtracted = [
        "Paracetamol",
        "Cetrizine",
        "Vitamin D3",
        "Omeprazole"
      ];
      setExtractedMedicines(mockExtracted);
      setIsProcessing(false);
      setShowPrescriptionUpload(false);
      alert(`✅ Prescription processed!\n\nFound ${mockExtracted.length} medicines:\n${mockExtracted.join(', ')}\n\nShowing matching results below.`);
    }, 2000);
  };

  const handleAddToCart = (medicine: any) => {
    if (!user) {
      onLoginRequired();
      return;
    }

    if (medicine.prescriptionRequired) {
      const confirm = window.confirm(
        `${medicine.name} requires a valid prescription.\n\nPlease upload your prescription before checkout.\n\nAdd to cart anyway?`
      );
      if (!confirm) return;
    }

    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.price,
      image: medicine.image,
      type: 'medicine',
      prescriptionRequired: medicine.prescriptionRequired
    });

    alert(`✅ ${medicine.name} added to cart!`);
  };



  return (
    <div className="min-h-screen bg-background">
      <Navigation onNavigate={onNavigate} cartCount={getItemCount()} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl mb-4">Order Medicines Online</h1>
            <p className="text-xl mb-8 opacity-90">Genuine medicines at your doorstep with fast delivery</p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for medicines, health products..."
                  className="pl-12 pr-4 py-6 text-lg bg-white"
                />
              </div>
            </div>

            {/* Upload Prescription Button */}
            <div className="mt-6">
              <Button
                onClick={() => setShowPrescriptionUpload(true)}
                size="lg"
                variant="secondary"
                className="bg-white text-pink-600 hover:bg-gray-100"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Upload Modal */}
      {showPrescriptionUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl">Upload Prescription</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPrescriptionUpload(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="mb-2">Click to upload or drag & drop</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, PDF (Max 5MB)</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Choose File"}
                </Button>
              </div>

              {uploadedFile && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{uploadedFile.name}</span>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Scanning prescription with OCR...</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex gap-3">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="mb-2"><strong>How it works:</strong></p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Upload your prescription image</li>
                      <li>AI extracts medicine names automatically</li>
                      <li>We show matching medicines from our catalog</li>
                      <li>Add to cart and checkout securely</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Extracted Medicines Banner */}
      {extractedMedicines.length > 0 && (
        <div className="bg-green-50 border-b border-green-200 py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800">
                  <strong>Prescription Scanned!</strong> Found {extractedMedicines.length} medicines: {extractedMedicines.join(', ')}
                </p>
                <button
                  onClick={() => setExtractedMedicines([])}
                  className="text-sm text-green-600 underline hover:text-green-700"
                >
                  Clear filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white border-b py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === cat.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <span className="mr-2">{typeof cat.icon === 'string' ? cat.icon : null}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl mb-2">Available Medicines</h2>
            <p className="text-muted-foreground">
              Showing {filteredMedicines.length} {filteredMedicines.length === 1 ? 'medicine' : 'medicines'}
            </p>
          </div>
          <Button variant="outline" onClick={() => onNavigate('home')}>
            View Cart ({getItemCount()})
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent mb-4"></div>
             <p className="text-muted-foreground font-medium">Loading pharmacy inventory...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine) => (
            <Card key={medicine.id} className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{medicine.image}</div>
                <div className="flex flex-col gap-2">
                  <Badge variant={medicine.stock === "In Stock" ? "default" : "secondary"}>
                    {medicine.stock}
                  </Badge>
                  {medicine.prescriptionRequired && (
                    <Badge variant="destructive" className="text-xs">
                      Rx Required
                    </Badge>
                  )}
                </div>
              </div>

              <h3 className="text-lg mb-1">{medicine.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{medicine.genericName}</p>
              <p className="text-xs text-muted-foreground mb-3">{medicine.pack}</p>

              <div className="flex items-center gap-2 mb-3">
                {medicine.benefits.slice(0, 2).map((benefit: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{medicine.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({medicine.reviews} reviews)</span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl text-pink-600">₹{medicine.price}</span>
                <span className="text-sm text-muted-foreground line-through">₹{medicine.mrp}</span>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100)}% OFF
                </Badge>
              </div>

              <Button
                onClick={() => handleAddToCart(medicine)}
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </Card>
          ))}
          </div>
        )}

        {!loading && filteredMedicines.length === 0 && (
          <div className="text-center py-16">
            <Pill className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2">No medicines found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setExtractedMedicines([]);
            }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h4 className="mb-2">100% Genuine</h4>
              <p className="text-sm text-muted-foreground">All medicines verified</p>
            </div>
            <div>
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h4 className="mb-2">Best Prices</h4>
              <p className="text-sm text-muted-foreground">Lowest prices guaranteed</p>
            </div>
            <div>
              <Clock className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h4 className="mb-2">Fast Delivery</h4>
              <p className="text-sm text-muted-foreground">Same-day delivery available</p>
            </div>
            <div>
              <Heart className="w-12 h-12 mx-auto mb-3 text-pink-600" />
              <h4 className="mb-2">Expert Support</h4>
              <p className="text-sm text-muted-foreground">24/7 pharmacist help</p>
            </div>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
