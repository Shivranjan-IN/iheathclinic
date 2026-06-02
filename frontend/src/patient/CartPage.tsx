import { useState, useEffect, useRef } from 'react';
import {
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    ArrowLeft,
    CreditCard,
    Truck,
    Shield,
    MapPin,
    Navigation
} from 'lucide-react';
import { ImageWithFallback } from "../public/figma/ImageWithFallback";
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { medicineService } from '../services/medicineService';
import { patientService } from '../services/patientService';
import { toast } from 'sonner';
import type { PatientUser } from './PatientPortal';

export function CartPage({ patient, onNavigate }: { patient: PatientUser | null; onNavigate: (page: any) => void }) {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deliveryAddress, setDeliveryAddress] = useState(patient?.address || '');
    const [locationMode, setLocationMode] = useState<'manual' | 'current'>('manual');
    const [addressDetails, setAddressDetails] = useState({
        street: patient?.address || '',
        city: '',
        state: '',
        pincode: '',
        lat: '',
        lng: ''
    });
    const [isLocating, setIsLocating] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!patient) {
            onNavigate('login');
            return;
        }
        fetchCart();
        fetchSavedAddresses();

        // Dynamically load Leaflet CDN
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
            setLeafletLoaded(true);
        };
        document.head.appendChild(script);

        return () => {
            try {
                document.head.removeChild(link);
                document.head.removeChild(script);
            } catch (e) {
                // ignore
            }
        };
    }, [patient, onNavigate]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await medicineService.getCart();
            setCartItems(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedAddresses = async () => {
        try {
            const data = await patientService.getSavedAddresses();
            setSavedAddresses(data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const handleSaveAddress = async () => {
        if (!addressDetails.street) {
            toast.error('Street/Address is required');
            return;
        }
        try {
            await patientService.saveAddress({
                address: addressDetails.street,
                city: addressDetails.city,
                state: addressDetails.state,
                pin_code: addressDetails.pincode,
                latitude: addressDetails.lat ? parseFloat(addressDetails.lat) : undefined,
                longitude: addressDetails.lng ? parseFloat(addressDetails.lng) : undefined
            });
            toast.success('Address saved successfully!');
            fetchSavedAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        }
    };

    const handleDeleteSavedAddress = async (addressId: number) => {
        try {
            await patientService.deleteAddress(addressId);
            toast.success('Address deleted successfully!');
            fetchSavedAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    const handleSelectSavedAddress = (addr: any) => {
        setAddressDetails({
            street: addr.address || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pin_code || '',
            lat: addr.latitude ? addr.latitude.toString() : '',
            lng: addr.longitude ? addr.longitude.toString() : ''
        });
        setDeliveryAddress(addr.address || '');
        setLocationMode('manual');
        toast.success('Saved address loaded!');
    };

    useEffect(() => {
        if (!leafletLoaded) return;
        const L = (window as any).L;
        if (!L) return;

        const startLat = addressDetails.lat ? parseFloat(addressDetails.lat) : 28.6139;
        const startLng = addressDetails.lng ? parseFloat(addressDetails.lng) : 77.2090;

        if (!mapRef.current) {
            const container = document.getElementById('leaflet-map');
            if (!container) return; // Wait until container is rendered in DOM

            // Fix default Leaflet icon paths in React/CDN
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const initialZoom = addressDetails.lat ? 16 : 13;
            mapRef.current = L.map('leaflet-map').setView([startLat, startLng], initialZoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapRef.current);

            markerRef.current = L.marker([startLat, startLng], { draggable: true }).addTo(mapRef.current);

            markerRef.current.on('dragend', async () => {
                const position = markerRef.current.getLatLng();
                const { lat, lng } = position;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    if (data.address) {
                        setAddressDetails({
                            street: data.display_name || '',
                            city: data.address.city || data.address.town || data.address.county || '',
                            state: data.address.state || '',
                            pincode: data.address.postcode || '',
                            lat: lat.toFixed(6),
                            lng: lng.toFixed(6)
                        });
                        setLocationMode('current');
                    }
                } catch (error) {
                    console.error('Error reverse geocoding:', error);
                }
            });
        } else {
            // Update map view and marker position without re-triggering events
            const currentCenter = mapRef.current.getCenter();
            if (currentCenter.lat.toFixed(4) !== startLat.toFixed(4) || currentCenter.lng.toFixed(4) !== startLng.toFixed(4)) {
                const currentZoom = mapRef.current.getZoom();
                // If map is at default low zoom (<=13) and we now have a location, zoom in to 16 for better precision.
                // Otherwise preserve current zoom.
                const targetZoom = (currentZoom <= 13 && addressDetails.lat) ? 16 : currentZoom;
                mapRef.current.setView([startLat, startLng], targetZoom);
            }
            const markerPos = markerRef.current.getLatLng();
            if (markerPos.lat.toFixed(4) !== startLat.toFixed(4) || markerPos.lng.toFixed(4) !== startLng.toFixed(4)) {
                markerRef.current.setLatLng([startLat, startLng]);
            }
        }
    }, [leafletLoaded, addressDetails.lat, addressDetails.lng]);

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        if (quantity < 1) return;
        try {
            await medicineService.updateCartQuantity(itemId, quantity);
            fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            await medicineService.removeFromCart(itemId);
            fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        
        setIsLocating(true);

        const handleSuccess = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                
                if (data.address) {
                    setAddressDetails({
                        street: data.display_name || '',
                        city: data.address.city || data.address.town || data.address.county || '',
                        state: data.address.state || '',
                        pincode: data.address.postcode || '',
                        lat: latitude.toString(),
                        lng: longitude.toString()
                    });
                    setLocationMode('current');
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                alert('Failed to get address details');
            } finally {
                setIsLocating(false);
            }
        };

        const handleIPFallback = async () => {
            try {
                const ipResponse = await fetch('https://ipapi.co/json/');
                const ipData = await ipResponse.json();
                if (ipData.latitude && ipData.longitude) {
                    setAddressDetails({
                        street: ipData.org || ipData.city || '',
                        city: ipData.city || '',
                        state: ipData.region || '',
                        pincode: ipData.postal || '',
                        lat: ipData.latitude.toString(),
                        lng: ipData.longitude.toString()
                    });
                    setLocationMode('current');
                    toast.success('Auto-located approximately via IP!');
                    setIsLocating(false);
                    return;
                }
            } catch (ipErr) {
                console.error('IP fallback failed:', ipErr);
            }
            alert('Failed to get your location. Please verify browser location permissions or enter address manually.');
            setIsLocating(false);
        };

        // Try with high accuracy first
        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            async (error) => {
                console.error('High accuracy geolocation error:', error);
                // If timeout or position unavailable, retry with low accuracy
                if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
                    console.log('Attempting geolocation with low accuracy fallback...');
                    navigator.geolocation.getCurrentPosition(
                        handleSuccess,
                        async (lowAccError) => {
                            console.error('Low accuracy geolocation error:', lowAccError);
                            await handleIPFallback();
                        },
                        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
                    );
                } else {
                    // For permission denied or other errors, go straight to IP fallback
                    await handleIPFallback();
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;
        try {
            setPlacingOrder(true);
            const items = cartItems.map((item: any) => ({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                price: parseFloat(item.medicine.mrp)
            }));
            const subtotal = cartItems.reduce((sum: number, item: any) => sum + (parseFloat(item.medicine?.mrp) || 0) * item.quantity, 0);

            let finalAddress = deliveryAddress;
            if (locationMode === 'current' || addressDetails.city) {
                const parts = [addressDetails.street, addressDetails.city, addressDetails.state, addressDetails.pincode].filter(Boolean);
                finalAddress = parts.join(', ');
                if (addressDetails.lat && addressDetails.lng) {
                    finalAddress += ` (Lat: ${addressDetails.lat}, Lng: ${addressDetails.lng})`;
                }
            } else if (addressDetails.street) {
                finalAddress = addressDetails.street;
            }

            await medicineService.placeOrder({
                order_type: 'medicine',
                items,
                total_amount: subtotal + (subtotal >= 500 ? 0 : 50),
                delivery_address: finalAddress
            });

            onNavigate('orders');
        } catch (error) {
            console.error('Error placing order:', error);
        } finally {
            setPlacingOrder(false);
        }
    };

    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (parseFloat(item.medicine?.mrp) || 0) * item.quantity, 0);
    const tax = subtotal * 0.05; // 5% GST
    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const total = subtotal + tax + deliveryCharge;

    if (loading) {
        return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div></div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => onNavigate('medicine-store')} className="dark:text-slate-300 dark:hover:bg-slate-800">
                    <ArrowLeft className="size-5 mr-2" />
                    Back to Store
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Shopping Cart</h1>
            </div>

            {cartItems.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-pink-100 dark:border-slate-800 dark:bg-slate-900">
                    <CardContent className="space-y-4">
                        <ShoppingCart className="size-16 text-pink-200 dark:text-slate-700 mx-auto" />
                        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Your cart is empty</h2>
                        <p className="text-gray-500 dark:text-slate-400">Looks like you haven't added any medicines yet.</p>
                        <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => onNavigate('medicine-store')}>
                            Start Shopping
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <Card key={item.id} className="border-pink-50 dark:border-slate-800 dark:bg-slate-900">
                                <CardContent className="p-4 flex gap-4">
                                    <div className="size-20 bg-pink-50 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                        <ImageWithFallback
                                            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
                                            alt={item.medicine?.medicine_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.medicine?.medicine_name}</h3>
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 dark:hover:bg-slate-800" onClick={() => handleRemoveItem(item.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">{item.medicine?.manufacturer}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="icon" className="size-8 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                                    <Minus className="size-3" />
                                                </Button>
                                                <span className="w-8 text-center font-medium dark:text-white">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="size-8 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                                    <Plus className="size-3" />
                                                </Button>
                                            </div>
                                            <span className="font-semibold dark:text-white">₹{(parseFloat(item.medicine?.mrp) || 0) * item.quantity}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Card className="border-pink-100 dark:border-slate-800 bg-pink-50/30 dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-lg dark:text-white">Delivery Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    {savedAddresses.length > 0 && (
                                        <div className="space-y-2 pb-3 border-b border-pink-100 dark:border-slate-800">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                                                <MapPin className="size-3 text-pink-600" />
                                                Select Saved Address
                                            </span>
                                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                                                {savedAddresses.map((addr) => (
                                                    <div 
                                                        key={addr.id} 
                                                        className="flex justify-between items-center p-2 rounded-lg border border-pink-100 dark:border-slate-800 dark:bg-slate-950 text-xs hover:border-pink-300 dark:hover:border-slate-700 transition"
                                                    >
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleSelectSavedAddress(addr)}
                                                            className="flex-1 text-left dark:text-white hover:text-pink-600 dark:hover:text-pink-400 font-medium truncate"
                                                        >
                                                            {addr.address}, {addr.city}, {addr.state} - {addr.pin_code}
                                                        </button>
                                                        <Button 
                                                            type="button"
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="size-6 text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-slate-900" 
                                                            onClick={() => handleDeleteSavedAddress(addr.id)}
                                                        >
                                                            <Trash2 className="size-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button 
                                            variant={locationMode === 'current' ? 'default' : 'outline'}
                                            className={locationMode === 'current' ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}
                                            onClick={getCurrentLocation}
                                            disabled={isLocating}
                                        >
                                            {isLocating ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <Navigation className="size-4 mr-2" />
                                            )}
                                            Use Current Location
                                        </Button>
                                        <Button 
                                            variant={locationMode === 'manual' ? 'default' : 'outline'}
                                            className={locationMode === 'manual' ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}
                                            onClick={() => setLocationMode('manual')}
                                        >
                                            <MapPin className="size-4 mr-2" />
                                            Enter Manually
                                        </Button>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-pink-100 dark:border-slate-800">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 dark:text-slate-400">Street / Full Address</label>
                                            <Input
                                                value={addressDetails.street}
                                                onChange={(e) => setAddressDetails({...addressDetails, street: e.target.value})}
                                                placeholder="Enter your street address"
                                                className="mt-1 bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                                disabled={locationMode === 'current'}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 dark:text-slate-400">City</label>
                                                <Input
                                                    value={addressDetails.city}
                                                    onChange={(e) => setAddressDetails({...addressDetails, city: e.target.value})}
                                                    placeholder="City"
                                                    className="mt-1 bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                                    disabled={locationMode === 'current'}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 dark:text-slate-400">State</label>
                                                <Input
                                                    value={addressDetails.state}
                                                    onChange={(e) => setAddressDetails({...addressDetails, state: e.target.value})}
                                                    placeholder="State"
                                                    className="mt-1 bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                                    disabled={locationMode === 'current'}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 dark:text-slate-400">Pincode</label>
                                                <Input
                                                    value={addressDetails.pincode}
                                                    onChange={(e) => setAddressDetails({...addressDetails, pincode: e.target.value})}
                                                    placeholder="Pincode"
                                                    className="mt-1 bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                                    disabled={locationMode === 'current'}
                                                />
                                            </div>
                                            {(addressDetails.lat || addressDetails.lng) && (
                                                <div>
                                                    <label className="text-xs font-medium text-gray-700 dark:text-slate-400">Coordinates</label>
                                                    <Input
                                                        value={`${addressDetails.lat}, ${addressDetails.lng}`}
                                                        disabled
                                                        className="mt-1 bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-slate-500 dark:border-slate-800 text-xs"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 block">
                                                Locate on Map (Drag marker to adjust)
                                            </span>
                                            <div 
                                                id="leaflet-map" 
                                                style={{ height: '250px', width: '100%' }} 
                                                className="rounded-lg border border-pink-100 dark:border-slate-800 my-2 z-0" 
                                            />
                                        </div>

                                        <Button 
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSaveAddress}
                                            className="w-full mt-2 border-pink-200 text-pink-600 dark:border-slate-700 dark:text-pink-400 dark:hover:bg-slate-800"
                                        >
                                            <MapPin className="size-4 mr-2" />
                                            Save this Address for future orders
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-pink-700 dark:text-pink-400">
                                    <Truck className="size-4" />
                                    <span>Estimated delivery within 24-48 hours</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-pink-200 dark:border-slate-800 shadow-lg dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-lg dark:text-white">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600 dark:text-slate-400">
                                        <span>Subtotal</span>
                                        <span className="dark:text-slate-300">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-slate-400">
                                        <span>Tax (GST 5%)</span>
                                        <span className="dark:text-slate-300">₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-slate-400">
                                        <span>Delivery Charges</span>
                                        <span className={deliveryCharge === 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'dark:text-slate-300'}>
                                            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                        </span>
                                    </div>
                                    {subtotal < 500 && (
                                        <p className="text-[10px] text-pink-600 dark:text-pink-400 font-medium italic">
                                            Add ₹{500 - subtotal} more for FREE delivery
                                        </p>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-pink-100 dark:border-slate-800 flex justify-between items-center">
                                    <span className="font-bold text-lg dark:text-white">Total Amount</span>
                                    <span className="font-bold text-lg text-pink-600 dark:text-pink-400">₹{total}</span>
                                </div>
                                <Button
                                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-6 text-lg font-bold"
                                    onClick={handlePlaceOrder}
                                    disabled={placingOrder}
                                >
                                    {placingOrder ? 'Processing...' : (
                                        <>
                                            <CreditCard className="size-5 mr-2" />
                                            Place Order
                                        </>
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                                    <Shield className="size-3" />
                                    Secure Checkout
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
