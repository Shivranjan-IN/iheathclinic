import { useState, useEffect, useRef } from 'react';
import { patientService } from '../services/patientService';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Edit,
  Save,
  Shield,
  Upload,
  File,
  Eye,
  X,
  Droplet,
  Download,
  Camera,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { Textarea } from '../common/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../common/ui/avatar';
import { Badge } from '../common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/ui/tabs';
import type { PatientUser } from './PatientPortal';

interface PatientProfileProps {
  patient: PatientUser;
  onProfileUpdate?: (updatedPatient: PatientUser) => void;
}


export function PatientProfile({ patient: initialPatient, onProfileUpdate }: PatientProfileProps) {
  const [patient, setPatient] = useState(initialPatient);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: initialPatient.name || '',
    email: initialPatient.email || '',
    phone: initialPatient.phone || '',
    age: initialPatient.age || 0,
    gender: initialPatient.gender || 'Male',
    blood_group: initialPatient.bloodGroup || 'O+',
    address: initialPatient.address || '',
    abha_id: initialPatient.abhaId || '',
    insurance_id: initialPatient.insuranceId || '',
    date_of_birth: initialPatient.dob 
      ? (typeof initialPatient.dob === 'string' ? initialPatient.dob.split('T')[0] : initialPatient.dob.toISOString().split('T')[0])
      : '',
    emergency_contact: initialPatient.emergencyContact || ''
  });
  const [allergies, setAllergies] = useState<string[]>(initialPatient.allergies || []);
  const [medications, setMedications] = useState<string[]>(initialPatient.currentMedications || []);
  const [chronicDiseases, setChronicDiseases] = useState<string[]>(initialPatient.chronicDiseases || []);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const [docType, setDocType] = useState('Medical Record');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Helper to parse coordinates from the profile address string
  const parseCoordinates = (addressText: string) => {
    if (!addressText) return null;
    const regex = /\(Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)\)/i;
    const match = addressText.match(regex);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    return null;
  };

  const updateAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          address: `${data.display_name} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`
        }));
        setMapCoordinates({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
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
      await updateAddressFromCoords(latitude, longitude);
      setIsLocating(false);
    };

    const handleIPFallback = async () => {
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        if (ipData.latitude && ipData.longitude) {
          const lat = ipData.latitude;
          const lng = ipData.longitude;
          const street = ipData.org || ipData.city || '';
          const parts = [street, ipData.city, ipData.region, ipData.postal].filter(Boolean).join(', ');
          setFormData(prev => ({
            ...prev,
            address: `${parts} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`
          }));
          setMapCoordinates({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
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

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      async (error) => {
        console.error('High accuracy geolocation error:', error);
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
          console.log('Attempting geolocation with low accuracy...');
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            async (lowAccError) => {
              console.error('Low accuracy geolocation error:', lowAccError);
              await handleIPFallback();
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
          );
        } else {
          await handleIPFallback();
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!isEditing) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      setLeafletLoaded(false);
      return;
    }

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
  }, [isEditing]);

  useEffect(() => {
    if (!leafletLoaded || !isEditing) return;
    const L = (window as any).L;
    if (!L) return;

    // Parse coordinates from address
    const coords = parseCoordinates(formData.address) || { lat: 28.6139, lng: 77.2090 };
    const startLat = mapCoordinates.lat ? parseFloat(mapCoordinates.lat) : coords.lat;
    const startLng = mapCoordinates.lng ? parseFloat(mapCoordinates.lng) : coords.lng;

    if (!mapRef.current) {
      const container = document.getElementById('profile-leaflet-map');
      if (!container) return;

      // Fix default Leaflet icon paths in React/CDN
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialZoom = (startLat !== 28.6139 || startLng !== 77.2090) ? 16 : 13;
      mapRef.current = L.map('profile-leaflet-map').setView([startLat, startLng], initialZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      markerRef.current = L.marker([startLat, startLng], { draggable: true }).addTo(mapRef.current);

      markerRef.current.on('dragend', async () => {
        const position = markerRef.current.getLatLng();
        await updateAddressFromCoords(position.lat, position.lng);
      });
    } else {
      const currentCenter = mapRef.current.getCenter();
      if (currentCenter.lat.toFixed(4) !== startLat.toFixed(4) || currentCenter.lng.toFixed(4) !== startLng.toFixed(4)) {
        const currentZoom = mapRef.current.getZoom();
        const targetZoom = (currentZoom <= 13 && (startLat !== 28.6139 || startLng !== 77.2090)) ? 16 : currentZoom;
        mapRef.current.setView([startLat, startLng], targetZoom);
      }
      const markerPos = markerRef.current.getLatLng();
      if (markerPos.lat.toFixed(4) !== startLat.toFixed(4) || markerPos.lng.toFixed(4) !== startLng.toFixed(4)) {
        markerRef.current.setLatLng([startLat, startLng]);
      }
    }
  }, [leafletLoaded, isEditing, mapCoordinates.lat, mapCoordinates.lng]);

  useEffect(() => {
    setPatient(initialPatient);
    setFormData({
      full_name: initialPatient.name || '',
      email: initialPatient.email || '',
      phone: initialPatient.phone || '',
      age: initialPatient.age || 0,
      gender: initialPatient.gender || 'Male',
      blood_group: initialPatient.bloodGroup || 'O+',
      address: initialPatient.address || '',
      abha_id: initialPatient.abhaId || '',
      insurance_id: initialPatient.insuranceId || '',
      date_of_birth: initialPatient.dob 
        ? (typeof initialPatient.dob === 'string' ? initialPatient.dob.split('T')[0] : initialPatient.dob.toISOString().split('T')[0])
        : '',
      emergency_contact: initialPatient.emergencyContact || ''
    });
    // Sync medical data from patient prop
    setAllergies(initialPatient.allergies || []);
    setMedications(initialPatient.currentMedications || []);
    setChronicDiseases(initialPatient.chronicDiseases || []);
  }, [initialPatient]);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await patientService.getMyDocuments();
      setDocuments(data || []);
    } catch (e) {
      console.error('Error fetching documents:', e);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setDocUploading(true);
      await patientService.uploadDocument(file, docType);
      await fetchDocuments();
    } catch (err: any) {
      console.error('Error uploading document:', err);
    } finally {
      setDocUploading(false);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
    }
  };

  const handleDocumentDelete = async (docId: number) => {
    try {
      await patientService.deleteDocument(docId);
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleSave = async () => {
    setFormError('');
    if (!formData.full_name.trim()) {
      setFormError('Full name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Phone number is required');
      return;
    }
    try {
      setSaving(true);
      // Include medical data in the update to database
      const updated = await patientService.updatePatientProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
        blood_group: formData.blood_group,
        address: formData.address,
        abha_id: formData.abha_id,
        insurance_id: formData.insurance_id,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth) : undefined,
        allergies: allergies,
        chronicDiseases: chronicDiseases,
        currentMedications: medications,
        emergency_contact: formData.emergency_contact
      });
      if (updated) {
        setIsEditing(false);
        // Update local patient state with the returned data from database
        const updatedPatient: PatientUser = {
          ...patient,
          name: updated.full_name || patient.name,
          phone: updated.phone || patient.phone,
          age: updated.age || patient.age,
          gender: updated.gender || patient.gender,
          bloodGroup: updated.blood_group || patient.bloodGroup,
          address: updated.address || patient.address,
          abhaId: updated.abha_id || patient.abhaId,
          insuranceId: updated.insurance_id || patient.insuranceId,
          dob: updated.date_of_birth || patient.dob,
          allergies: updated.allergies || allergies,
          chronicDiseases: updated.chronicDiseases || chronicDiseases,
          currentMedications: updated.currentMedications || medications,
          emergencyContact: updated.emergency_contact || patient.emergencyContact
        };
        setPatient(updatedPatient);
        // Notify parent component about the update
        if (onProfileUpdate) {
          onProfileUpdate(updatedPatient);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };



  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const updated = await patientService.uploadProfilePhoto(file);
      if (updated && updated.profile_photo_url) {
        const updatedPatient: PatientUser = {
          ...patient,
          avatar: updated.profile_photo_url
        };
        setPatient(updatedPatient);
        if (onProfileUpdate) {
          onProfileUpdate(updatedPatient);
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 space-y-6">
      {formError && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {formError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">My Profile</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your personal and medical information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form to current patient state
                  setFormData({
                    full_name: patient.name || '',
                    email: patient.email || '',
                    phone: patient.phone || '',
                    age: patient.age || 0,
                    gender: patient.gender || 'Male',
                    blood_group: patient.bloodGroup || 'O+',
                    address: patient.address || '',
                    abha_id: patient.abhaId || '',
                    insurance_id: patient.insuranceId || '',
                    date_of_birth: patient.dob
                      ? (typeof patient.dob === 'string' ? patient.dob.split('T')[0] : patient.dob.toISOString().split('T')[0])
                      : '',
                    emergency_contact: patient.emergencyContact || ''
                  });
                  setAllergies(patient.allergies || []);
                  setMedications(patient.currentMedications || []);
                  setChronicDiseases(patient.chronicDiseases || []);
                }}
              >
                <X className="size-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white"
              >
                {saving ? (
                  <>
                    <Save className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-pink-300 dark:border-pink-700/50 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:bg-pink-900/20"
            >
              <Edit className="size-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-pink-200 dark:border-pink-800/30">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-24 mb-4">
                {patient.avatar ? (
                  <AvatarImage src={patientService.getFullUrl(patient.avatar)} alt={patient.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-2xl">
                    {patient.name?.charAt(0) || 'P'}
                  </AvatarFallback>
                )}
              </Avatar>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{patient.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{patient.email}</p>

              {patient.abhaId && (
                <div className="w-full p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg mb-4 border border-pink-200 dark:border-pink-800/30">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="size-4 text-pink-600 dark:text-pink-400" />
                    <p className="text-xs font-medium text-pink-900 dark:text-pink-100">ABHA ID</p>
                  </div>
                  <p className="text-sm font-mono text-pink-700 dark:text-pink-300">{patient.abhaId}</p>
                </div>
              )}

              <div className="w-full space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{patient.age} years old</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{patient.address || 'Location N/A'}</span>
                </div>
              </div>

              {!isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    className="w-full mt-6"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Camera className="size-4 mr-2 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="size-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2 border-pink-200 dark:border-pink-800/30">
          <CardHeader>
            <CardTitle className="text-pink-900 dark:text-pink-100">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">
                  <User className="size-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="medical">
                  <Heart className="size-4 mr-2" />
                  Medical
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <File className="size-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-4">
                {!isEditing && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                    <Edit className="size-4 shrink-0" />
                    Click <strong>Edit Profile</strong> above to make changes.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50 dark:bg-gray-900'}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (read-only)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="mt-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50 dark:bg-gray-900'}`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50 dark:bg-gray-900'}`}
                      placeholder="Enter age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    {isEditing ? (
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="mt-2 w-full h-10 px-3 rounded-md border border-pink-400 ring-1 ring-pink-300 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <Input id="gender" value={formData.gender} disabled className="mt-2 bg-gray-50 dark:bg-gray-900" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    {isEditing ? (
                      <select
                        id="bloodGroup"
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        className="mt-2 w-full h-10 px-3 rounded-md border border-pink-400 ring-1 ring-pink-300 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    ) : (
                      <Input id="bloodGroup" value={formData.blood_group} disabled className="mt-2 bg-gray-50 dark:bg-gray-900" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50 dark:bg-gray-900'}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50 dark:bg-gray-900'}`}
                      placeholder="Enter emergency contact number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="address">Residential Address</Label>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={isLocating}
                        className="border-pink-200 text-pink-600 dark:border-pink-850 dark:text-pink-400 hover:bg-pink-50"
                      >
                        {isLocating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600 mr-2"></div>
                        ) : (
                          <Navigation className="size-4 mr-2" />
                        )}
                        Use Current Location
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50 dark:bg-gray-900'}`}
                    placeholder="Enter your full address"
                  />
                  {isEditing && (
                    <div className="mt-4 space-y-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                        Locate on Map (Drag marker to adjust)
                      </span>
                      <div
                        id="profile-leaflet-map"
                        style={{ height: '250px', width: '100%' }}
                        className="rounded-lg border border-pink-200 dark:border-pink-850 my-2 z-0"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6 mt-4">
                <Card className="border-pink-200 dark:border-pink-800/30 bg-pink-50 dark:bg-pink-900/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="size-5 text-pink-600 dark:text-pink-400" />
                      Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* ABHA ID */}
                    <div>
                      <Label>ABHA Health ID</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={formData.abha_id}
                          onChange={(e) => setFormData({ ...formData, abha_id: e.target.value })}
                          disabled={!isEditing}
                          className="font-mono bg-white dark:bg-gray-800"
                        />
                        <Badge className="bg-green-600">Verified</Badge>
                      </div>
                    </div>
                    {/* Insurance ID */}
                    <div>
                      <Label>Insurance ID</Label>
                      <Input
                        value={formData.insurance_id}
                        onChange={(e) => setFormData({ ...formData, insurance_id: e.target.value })}
                        disabled={!isEditing}
                        className="mt-2 bg-white dark:bg-gray-800"
                        placeholder="Enter your Insurance ID"
                      />
                    </div>

                    {/* Blood Group */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Droplet className="size-4 text-pink-600 dark:text-pink-400" />
                        Blood Group
                      </Label>
                      <Input
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        disabled={!isEditing}
                        className="mt-2 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </CardContent>
                </Card>

                {isEditing && (
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    <Save className="size-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Medical Details'}
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-4">
                {/* Upload Section */}
                <Card className="border-2 border-dashed border-pink-300 dark:border-pink-700/50 bg-pink-50 dark:bg-pink-900/20">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-pink-100 rounded-full">
                          <Upload className="size-8 text-pink-600 dark:text-pink-400" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Upload Documents</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload Medical Records, Insurance Card, or other documents
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <select
                          value={docType}
                          onChange={e => setDocType(e.target.value)}
                          className="border border-pink-200 dark:border-pink-800/30 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          {['Medical Record', 'Insurance', 'Lab Report', 'Prescription', 'Other'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <input
                          type="file"
                          ref={docFileInputRef}
                          onChange={handleDocumentUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                        />
                        <Button
                          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                          onClick={() => docFileInputRef.current?.click()}
                          disabled={docUploading}
                        >
                          <Upload className="size-4 mr-2" />
                          {docUploading ? 'Uploading...' : 'Choose File'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents List */}
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-4">No documents uploaded yet.</p>
                  ) : (
                    documents.map((doc) => (
                      <Card key={doc.id} className="border-pink-200 dark:border-pink-800/30 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-pink-100 rounded-lg">
                                <File className="size-5 text-pink-600 dark:text-pink-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">{doc.file_name}</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {doc.document_type}
                                  </Badge>
                                  <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ''}</span>
                                  {doc.file_size && <span>{Math.round(doc.file_size / 1024)} KB</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.file_url && (
                                <Button size="sm" variant="outline" onClick={() => window.open(doc.file_url, '_blank')}>
                                  <Eye className="size-4 mr-1" />
                                  View
                                </Button>
                              )}
                              {doc.file_url && (
                                <a href={doc.file_url} download={doc.file_name}>
                                  <Button size="sm" variant="outline" className="bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700/50 text-pink-600 dark:text-pink-400 hover:bg-pink-100">
                                    <Download className="size-4 mr-1" />
                                    Download
                                  </Button>
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDocumentDelete(doc.id)}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

