import { useEffect, useState, useCallback } from 'react';
import { UserRole } from '../common/types';
import { Search, Plus, Package, AlertTriangle, TrendingDown, X, Loader2, RefreshCw } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast } from 'sonner';

interface PharmacyInventoryProps {
  userRole: UserRole;
}

interface Medicine {
  medicine_id: string;
  medicine_name: string;
  category: string;
  manufacturer?: string;
  batch_number?: string;
  expiry_date?: string;
  stock_quantity: number;
  min_stock?: number;
  purchase_price?: number;
  mrp?: number;
  storage_location?: string;
  clinic_id?: number;
}

const EMPTY_FORM = {
  medicine_name: '',
  category: '',
  manufacturer: '',
  batch_number: '',
  expiry_date: '',
  stock_quantity: '',
  min_stock: '',
  purchase_price: '',
  mrp: '',
  storage_location: '',
};

const CATEGORIES = [
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler', 'Device', 'Other'
];

export function PharmacyInventory({ userRole }: PharmacyInventoryProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clinicService.getMedicines(true);
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Derived stats
  const totalItems = medicines.length;
  const lowStockItems = medicines.filter(
    m => m.min_stock != null && m.stock_quantity <= m.min_stock
  );
  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);
  const expiringItems = medicines.filter(m => {
    if (!m.expiry_date) return false;
    const exp = new Date(m.expiry_date);
    return exp <= in30Days;
  });

  const filtered = medicines.filter(m => {
    const matchSearch =
      m.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const uniqueCategories = [...new Set(medicines.map(m => m.category).filter(Boolean))];

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < today;
  };

  const isLowStock = (m: Medicine) =>
    m.min_stock != null && m.stock_quantity <= m.min_stock;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.medicine_name.trim()) errors.medicine_name = 'Medicine name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.stock_quantity) errors.stock_quantity = 'Stock quantity is required';
    else if (isNaN(Number(formData.stock_quantity)) || Number(formData.stock_quantity) < 0)
      errors.stock_quantity = 'Enter a valid quantity';
    if (formData.mrp && isNaN(Number(formData.mrp))) errors.mrp = 'Enter a valid price';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMedicine = async () => {
    if (!validateForm()) return;
    try {
      setAddLoading(true);
      const payload: any = {
        medicine_name: formData.medicine_name.trim(),
        category: formData.category,
        manufacturer: formData.manufacturer || undefined,
        batch_number: formData.batch_number || undefined,
        expiry_date: formData.expiry_date || undefined,
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : undefined,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        storage_location: formData.storage_location || undefined,
      };
      await clinicService.addMedicine(payload);
      toast.success('Medicine added to inventory!');
      setShowAddModal(false);
      setFormData(EMPTY_FORM);
      setFormErrors({});
      fetchMedicines();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add medicine.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading pharmacy inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy & Inventory</h1>
          <p className="text-gray-600">{totalItems} medicines in stock</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedicines}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {(userRole === 'clinic' || userRole === 'admin' || userRole === 'pharmacist' as any) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Medicine
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><TrendingDown className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              <p className="text-sm text-gray-600">Low Stock Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{expiringItems.length}</p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.slice(0, 5).map(m => (
              <span key={m.medicine_id} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                {m.medicine_name} ({m.stock_quantity} left)
              </span>
            ))}
            {lowStockItems.length > 5 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                +{lowStockItems.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search medicines..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {medicines.length === 0 ? 'No medicines in inventory. Add your first medicine.' : 'No medicines match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRP (₹)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(med => {
                  const expired = isExpired(med.expiry_date);
                  const lowStock = isLowStock(med);
                  return (
                    <tr key={med.medicine_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{med.medicine_name}</p>
                        {med.manufacturer && <p className="text-xs text-gray-500">{med.manufacturer}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{med.category || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{med.batch_number || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        {med.expiry_date ? (
                          <span className={expired ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {new Date(med.expiry_date).toLocaleDateString('en-IN')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-semibold ${lowStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {med.stock_quantity}
                        </span>
                        {med.min_stock != null && (
                          <span className="text-xs text-gray-400 ml-1">/ min {med.min_stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {med.mrp != null ? `₹${Number(med.mrp).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {expired ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>
                        ) : lowStock ? (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Low Stock</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add New Medicine</h2>
              <button onClick={() => { setShowAddModal(false); setFormData(EMPTY_FORM); setFormErrors({}); }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Medicine Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                <input
                  name="medicine_name"
                  value={formData.medicine_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.medicine_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Paracetamol 500mg"
                />
                {formErrors.medicine_name && <p className="text-xs text-red-500 mt-1">{formErrors.medicine_name}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Manufacturer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input name="manufacturer" value={formData.manufacturer} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Company name" />
                </div>
                {/* Batch Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch No.</label>
                  <input name="batch_number" value={formData.batch_number} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., BATCH001" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                {/* Storage Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                  <input name="storage_location" value={formData.storage_location} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Rack A-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty *</label>
                  <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.stock_quantity ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0" min="0" />
                  {formErrors.stock_quantity && <p className="text-xs text-red-500 mt-1">{formErrors.stock_quantity}</p>}
                </div>
                {/* Min Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                  <input type="number" name="min_stock" value={formData.min_stock} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Reorder level" min="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
                  <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0.00" step="0.01" />
                </div>
                {/* MRP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                  <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.mrp ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0.00" step="0.01" />
                  {formErrors.mrp && <p className="text-xs text-red-500 mt-1">{formErrors.mrp}</p>}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleAddMedicine}
                disabled={addLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {addLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {addLoading ? 'Adding...' : 'Add Medicine'}
              </button>
              <button
                onClick={() => { setShowAddModal(false); setFormData(EMPTY_FORM); setFormErrors({}); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
