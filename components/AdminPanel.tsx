
import React, { useState, useEffect } from 'react';
import { Package, Plus, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, Trash2, Settings, Edit3, X, ShieldCheck, User as UserIcon, RefreshCw } from 'lucide-react';
import { addProduct, fetchProducts, deleteProduct, deleteAllProducts, updateProduct, getCurrentUser } from '../services/supabase';
import { Product } from '../types';
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
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Men',
    image_url: '',
    description: '',
    stock: '10'
  });

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

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      category: 'Men',
      image_url: '',
      description: '',
      stock: '10'
    });
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      description: product.description || '',
      stock: product.stock.toString()
    });
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

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await addProduct(payload);
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
              Please sign out and sign in with the correct credentials.
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
            className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center space-x-2 disabled:opacity-20 disabled:cursor-not-allowed group"
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
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="299.00"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
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
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Image URL</label>
                <input
                  required
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                />
              </div>

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl animate-in fade-in zoom-in-95">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {editingId ? 'Changes Saved' : 'Item Published'}
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-start space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 animate-in slide-in-from-left-4">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-normal">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!isAdmin && editingId !== null)}
                className={`w-full ${editingId ? 'bg-zinc-800' : 'bg-zinc-900'} text-white py-5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-[0.98]`}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="uppercase tracking-widest text-xs font-bold">{editingId ? 'Update Record' : 'Publish Item'}</span>}
              </button>
            </form>
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
