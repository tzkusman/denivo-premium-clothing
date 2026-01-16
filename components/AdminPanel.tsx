
import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, 
  Trash2, Settings, Edit3, X, ShieldCheck, RefreshCw, 
  DollarSign, Layers, FileText, ChevronDown, ChevronUp, Save
} from 'lucide-react';
import { 
  addProduct, fetchProducts, deleteProduct, deleteAllProducts, updateProduct, getCurrentUser,
  addProductImage, deleteProductImage, fetchProductImages,
  addProductSize, deleteProductSize, fetchProductSizes,
  updateProductDetails, fetchProductDetails,
  addBulkPricing, deleteBulkPricing, fetchBulkPricing
} from '../services/supabase';
import { Product, ProductImage, ProductSize, ProductDetails, BulkPricing } from '../types';
import { User } from '@supabase/supabase-js';

interface AdminPanelProps {
  onProductAdded: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onProductAdded }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'sizes' | 'details' | 'bulk'>('basic');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  // Basic product form
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Men',
    image_url: '',
    description: '',
    stock: '10'
  });

  // Extended details form
  const [detailsForm, setDetailsForm] = useState({
    short_description: '',
    long_description: '',
    materials: '',
    care_instructions: '',
    features: '',
    sku: ''
  });

  // Additional images
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Sizes
  const [productSizes, setProductSizes] = useState<ProductSize[]>([]);
  const [newSize, setNewSize] = useState({ size_label: '', size_value: '', stock: '10' });

  // Bulk pricing
  const [bulkPricing, setBulkPricing] = useState<BulkPricing[]>([]);
  const [newBulkTier, setNewBulkTier] = useState({ min_quantity: '', max_quantity: '', discount_percent: '' });

  const checkAuth = async () => {
    setAuthChecking(true);
    const user = await getCurrentUser();
    setCurrentUser(user);
    setAuthChecking(false);
  };

  const loadInventory = async () => {
    setFetching(true);
    const data = await fetchProducts();
    setProducts(data);
    setFetching(false);
  };

  useEffect(() => {
    loadInventory();
    checkAuth();
  }, []);

  // Load product extended data when editing
  const loadProductExtendedData = async (productId: string) => {
    const [images, sizes, details, pricing] = await Promise.all([
      fetchProductImages(productId),
      fetchProductSizes(productId),
      fetchProductDetails(productId),
      fetchBulkPricing(productId)
    ]);
    
    setProductImages(images);
    setProductSizes(sizes);
    setBulkPricing(pricing);
    
    if (details) {
      setDetailsForm({
        short_description: details.short_description || '',
        long_description: details.long_description || '',
        materials: details.materials || '',
        care_instructions: details.care_instructions || '',
        features: details.features?.join('\n') || '',
        sku: details.sku || ''
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setActiveTab('basic');
    setFormData({
      name: '',
      price: '',
      category: 'Men',
      image_url: '',
      description: '',
      stock: '10'
    });
    setDetailsForm({
      short_description: '',
      long_description: '',
      materials: '',
      care_instructions: '',
      features: '',
      sku: ''
    });
    setProductImages([]);
    setProductSizes([]);
    setBulkPricing([]);
    setNewImageUrl('');
    setNewSize({ size_label: '', size_value: '', stock: '10' });
    setNewBulkTier({ min_quantity: '', max_quantity: '', discount_percent: '' });
  };

  const startEdit = async (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      description: product.description || '',
      stock: product.stock.toString()
    });
    await loadProductExtendedData(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        description: formData.description,
        stock: parseInt(formData.stock)
      };

      let productId = editingId;

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        const result = await addProduct(payload);
        if (result && result[0]) {
          productId = result[0].id;
        }
      }

      // Save extended details if we have a product ID
      if (productId && (detailsForm.short_description || detailsForm.long_description || detailsForm.materials)) {
        await updateProductDetails(productId, {
          short_description: detailsForm.short_description,
          long_description: detailsForm.long_description,
          materials: detailsForm.materials,
          care_instructions: detailsForm.care_instructions,
          features: detailsForm.features.split('\n').filter(f => f.trim()),
          sku: detailsForm.sku,
          brand: 'Denivo'
        });
      }
      
      setSuccess(true);
      resetForm();
      loadInventory();
      onProductAdded();
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Action failed. Ensure your RLS policy allows updates.');
    } finally {
      setLoading(false);
    }
  };

  // Image handlers
  const handleAddImage = async () => {
    if (!editingId || !newImageUrl) return;
    setLoading(true);
    try {
      await addProductImage(editingId, { 
        image_url: newImageUrl, 
        display_order: productImages.length 
      });
      const images = await fetchProductImages(editingId);
      setProductImages(images);
      setNewImageUrl('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Delete this image?')) return;
    setLoading(true);
    try {
      await deleteProductImage(imageId);
      setProductImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Size handlers
  const handleAddSize = async () => {
    if (!editingId || !newSize.size_label || !newSize.size_value) return;
    setLoading(true);
    try {
      await addProductSize(editingId, {
        size_label: newSize.size_label,
        size_value: newSize.size_value,
        stock: parseInt(newSize.stock),
        is_available: true,
        display_order: productSizes.length
      });
      const sizes = await fetchProductSizes(editingId);
      setProductSizes(sizes);
      setNewSize({ size_label: '', size_value: '', stock: '10' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSize = async (sizeId: string) => {
    if (!window.confirm('Delete this size?')) return;
    setLoading(true);
    try {
      await deleteProductSize(sizeId);
      setProductSizes(prev => prev.filter(s => s.id !== sizeId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk pricing handlers
  const handleAddBulkTier = async () => {
    if (!editingId || !newBulkTier.min_quantity || !newBulkTier.discount_percent) return;
    setLoading(true);
    try {
      await addBulkPricing(editingId, {
        min_quantity: parseInt(newBulkTier.min_quantity),
        max_quantity: newBulkTier.max_quantity ? parseInt(newBulkTier.max_quantity) : null,
        discount_percent: parseFloat(newBulkTier.discount_percent)
      });
      const pricing = await fetchBulkPricing(editingId);
      setBulkPricing(pricing);
      setNewBulkTier({ min_quantity: '', max_quantity: '', discount_percent: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBulkTier = async (tierId: string) => {
    if (!window.confirm('Delete this pricing tier?')) return;
    setLoading(true);
    try {
      await deleteBulkPricing(tierId);
      setBulkPricing(prev => prev.filter(b => b.id !== tierId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete "${name}"?`)) return;
    
    setLoading(true);
    setError('');
    try {
      await deleteProduct(id);
      await loadInventory();
      onProductAdded();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("CRITICAL: This will delete EVERYTHING in the catalog. Proceed?")) return;
    
    setLoading(true);
    setError('');
    try {
      await deleteAllProducts();
      await loadInventory();
      onProductAdded();
      alert("Inventory purged successfully.");
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.email === 'tzkusman786@gmail.com';

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'images', label: 'Images', icon: ImageIcon, requiresEdit: true },
    { id: 'sizes', label: 'Sizes & Stock', icon: Layers, requiresEdit: true },
    { id: 'details', label: 'Description', icon: FileText },
    { id: 'bulk', label: 'Bulk Pricing', icon: DollarSign, requiresEdit: true },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-8">
      {/* Session Health Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50 border border-zinc-200 p-4 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {authChecking ? 'Verifying Session...' : `Session: ${currentUser?.email || 'Anonymous'}`}
          </div>
        </div>
        <button 
          onClick={checkAuth}
          className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center space-x-2 transition-colors"
        >
          <RefreshCw size={12} className={authChecking ? 'animate-spin' : ''} />
          <span>Sync Session</span>
        </button>
      </div>

      {!isAdmin && currentUser && !authChecking && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-start space-x-4 text-red-800 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Unauthorized Account</h4>
            <p className="text-xs leading-relaxed opacity-80">
              You are signed in as <strong>{currentUser.email}</strong>. 
              Only the master account <strong>tzkusman786@gmail.com</strong> can modify the database. 
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <Package size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-display font-bold">Denivo Command</h2>
            <div className="flex items-center space-x-2 mt-1">
              <ShieldCheck size={14} className={isAdmin ? 'text-green-400' : 'text-zinc-500'} />
              <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">
                {isAdmin ? 'Master Administrator Access' : 'Restricted Guest View'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleBulkDelete}
            disabled={loading || !isAdmin}
            className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center space-x-2 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            <span>Purge Inventory</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-xl p-8 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold flex items-center space-x-2 text-zinc-900">
                {editingId ? <Edit3 size={20} /> : <Plus size={20} className="text-zinc-400" />}
                <span>{editingId ? 'Edit Product' : 'New Arrival'}</span>
              </h3>
              {editingId && (
                <button onClick={resetForm} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  disabled={tab.requiresEdit && !editingId}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab.id
                      ? 'bg-zinc-900 text-white'
                      : tab.requiresEdit && !editingId
                        ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Product Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Italian Wool Blazer"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Price (PKR)</label>
                    <input
                      required
                      type="number"
                      step="1"
                      placeholder="29900"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Stock</label>
                    <input
                      required
                      type="number"
                      placeholder="10"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Category</label>
                  <select
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Main Image URL</label>
                  <input
                    required
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                  />
                  {formData.image_url && (
                    <div className="mt-3 w-20 h-24 rounded-lg overflow-hidden bg-zinc-100">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Quick Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief product description..."
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {success && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {editingId ? 'Changes Saved' : 'Item Published'}
                    </span>
                  </div>
                )}

                {error && (
                  <div className="flex items-start space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-normal">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isAdmin}
                  className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="uppercase tracking-widest text-xs font-bold">{editingId ? 'Update Product' : 'Publish Item'}</span>}
                </button>
              </form>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && editingId && (
              <div className="space-y-6">
                <p className="text-sm text-zinc-500">Add multiple images from different angles.</p>
                
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                  />
                  <button
                    onClick={handleAddImage}
                    disabled={loading || !newImageUrl}
                    className="px-4 py-3 bg-zinc-900 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {productImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img 
                        src={img.image_url} 
                        alt="" 
                        className="w-full aspect-[3/4] object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {productImages.length === 0 && (
                  <div className="text-center py-8 bg-zinc-50 rounded-xl text-zinc-400 text-sm">
                    No additional images added yet
                  </div>
                )}
              </div>
            )}

            {/* Sizes Tab */}
            {activeTab === 'sizes' && editingId && (
              <div className="space-y-6">
                <p className="text-sm text-zinc-500">Add available sizes with individual stock levels.</p>
                
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Label (S (4-6))"
                    className="px-3 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                    value={newSize.size_label}
                    onChange={e => setNewSize({...newSize, size_label: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Value (S)"
                    className="px-3 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                    value={newSize.size_value}
                    onChange={e => setNewSize({...newSize, size_value: e.target.value})}
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Stock"
                      className="w-full px-3 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                      value={newSize.stock}
                      onChange={e => setNewSize({...newSize, stock: e.target.value})}
                    />
                    <button
                      onClick={handleAddSize}
                      disabled={loading || !newSize.size_label}
                      className="px-4 py-3 bg-zinc-900 text-white rounded-xl font-bold disabled:opacity-50"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {productSizes.map(size => (
                    <div key={size.id} className="flex items-center justify-between bg-zinc-50 px-4 py-3 rounded-xl">
                      <div>
                        <span className="font-bold text-sm">{size.size_label}</span>
                        <span className="text-zinc-400 text-xs ml-2">({size.size_value})</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${size.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          Stock: {size.stock}
                        </span>
                        <button
                          onClick={() => handleDeleteSize(size.id)}
                          className="text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {productSizes.length === 0 && (
                  <div className="text-center py-8 bg-zinc-50 rounded-xl text-zinc-400 text-sm">
                    No sizes configured - default sizes will be shown
                  </div>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium tailored blazer for the modern gentleman"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                    value={detailsForm.short_description}
                    onChange={e => setDetailsForm({...detailsForm, short_description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Full Description</label>
                  <textarea
                    rows={5}
                    placeholder="Detailed product description with all features and benefits..."
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none resize-none"
                    value={detailsForm.long_description}
                    onChange={e => setDetailsForm({...detailsForm, long_description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Materials</label>
                    <input
                      type="text"
                      placeholder="e.g. 100% Italian Wool"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                      value={detailsForm.materials}
                      onChange={e => setDetailsForm({...detailsForm, materials: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">SKU</label>
                    <input
                      type="text"
                      placeholder="e.g. DNV-BLZ-001"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                      value={detailsForm.sku}
                      onChange={e => setDetailsForm({...detailsForm, sku: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Care Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Dry clean only. Store on wide hanger."
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                    value={detailsForm.care_instructions}
                    onChange={e => setDetailsForm({...detailsForm, care_instructions: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Features (one per line)</label>
                  <textarea
                    rows={4}
                    placeholder="Half-canvas construction
Genuine horn buttons
Fully lined interior
Modern slim fit"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none resize-none font-mono"
                    value={detailsForm.features}
                    onChange={e => setDetailsForm({...detailsForm, features: e.target.value})}
                  />
                </div>

                <p className="text-xs text-zinc-400">* Details are saved when you save the product in Basic Info tab</p>
              </div>
            )}

            {/* Bulk Pricing Tab */}
            {activeTab === 'bulk' && editingId && (
              <div className="space-y-6">
                <p className="text-sm text-zinc-500">Set volume discount tiers for bulk orders.</p>
                
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder="Min Qty"
                    className="px-3 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                    value={newBulkTier.min_quantity}
                    onChange={e => setNewBulkTier({...newBulkTier, min_quantity: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Max (opt)"
                    className="px-3 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                    value={newBulkTier.max_quantity}
                    onChange={e => setNewBulkTier({...newBulkTier, max_quantity: e.target.value})}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Disc %"
                    className="px-3 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none"
                    value={newBulkTier.discount_percent}
                    onChange={e => setNewBulkTier({...newBulkTier, discount_percent: e.target.value})}
                  />
                  <button
                    onClick={handleAddBulkTier}
                    disabled={loading || !newBulkTier.min_quantity}
                    className="px-4 py-3 bg-zinc-900 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {bulkPricing.map(tier => (
                    <div key={tier.id} className="flex items-center justify-between bg-zinc-50 px-4 py-3 rounded-xl">
                      <div>
                        <span className="font-bold text-sm">
                          {tier.min_quantity}+ units
                          {tier.max_quantity && ` (up to ${tier.max_quantity})`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                          {tier.discount_percent}% OFF
                        </span>
                        <button
                          onClick={() => handleDeleteBulkTier(tier.id)}
                          className="text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {bulkPricing.length === 0 && (
                  <div className="text-center py-8 bg-zinc-50 rounded-xl text-zinc-400 text-sm">
                    No bulk pricing tiers configured
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-xl font-display font-bold flex items-center space-x-2">
                <Settings size={20} className="text-zinc-400" />
                <span>Live Catalog</span>
              </h3>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {products.length} Products
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Product</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Stock</th>
                    <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {fetching ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <Loader2 className="animate-spin text-zinc-200 mx-auto" size={32} />
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-zinc-400 text-sm">
                        Database is empty.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className={`hover:bg-zinc-50/30 transition-colors group ${editingId === p.id ? 'bg-zinc-50' : ''}`}>
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-14 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-zinc-100">
                              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 uppercase truncate max-w-[150px]">{p.name}</p>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{p.category} • ${p.price}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${p.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-600'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => startEdit(p)}
                              className="p-3 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id, p.name)}
                              disabled={loading || !isAdmin}
                              className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-10 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
