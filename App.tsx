
import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order } from './types';
import { fetchProducts, fetchProductsByCategory, onAuthChange, getSession } from './services/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import AIAssistant from './components/AIAssistant';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import ProductDetailPage from './components/ProductDetailPage';
import CheckoutPage from './components/CheckoutPage';
import { Loader2, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [view, setView] = useState<'home' | 'men' | 'women' | 'admin'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const loadCatalog = async () => {
    try {
      let data: Product[] = [];
      if (view === 'home' || view === 'admin') {
        data = await fetchProducts();
      } else {
        data = await fetchProductsByCategory(view);
      }
      setProducts(data);
    } catch (err) {
      console.error("Catalog load error:", err);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      try {
        const unsubscribe = onAuthChange((u, session) => {
          setUser(u);
          if (window.location.hash.includes('access_token')) {
             window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        });

        const session = await getSession();
        if (session?.user) {
          setUser(session.user);
        }

        await loadCatalog();
        
        return () => unsubscribe();
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, [view]);

  const handleHeroAction = () => {
    const el = document.getElementById('collection-header');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add to cart - NO login required (guest checkout supported)
  const addToCart = (product: Product, quantity: number = 1, size?: string) => {
    setCart(prev => {
      const cartKey = size ? `${product.id}-${size}` : product.id;
      const existing = prev.find(item => 
        size ? (item.id === product.id && item.selectedSize === size) : item.id === product.id
      );
      if (existing) {
        return prev.map(item => 
          (size ? (item.id === product.id && item.selectedSize === size) : item.id === product.id)
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedSize: size }];
    });
    setIsCartOpen(true);
    setSelectedProductId(null); // Close product detail after adding
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setShowCheckout(true);
  };

  const handleOrderComplete = (order: Order) => {
    // Clear cart after successful order
    setCart([]);
  };

  const openProductDetail = (productId: string) => {
    setSelectedProductId(productId);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, q: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: q } : item));
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-display font-bold text-zinc-900 mb-8 animate-pulse">DENIVO</h1>
        <Loader2 className="animate-spin text-zinc-900" size={32} />
      </div>
    );
  }

  const heroImages = {
    home: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    men: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=2000&auto=format&fit=crop",
    women: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    admin: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop"
  };

  const heroTitles = {
    home: "The New Evolution",
    men: "The Modern Gentleman",
    women: "Contemporary Elegance",
    admin: "Inventory Control"
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onViewChange={setView}
        currentView={view}
      />
      
      <main>
        {view === 'admin' ? (
          <AdminPanel onProductAdded={loadCatalog} />
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
              <img 
                src={heroImages[view]} 
                alt="Hero Fashion" 
                className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 flex flex-col items-center justify-end pb-20 px-4 text-center">
                <h2 className="text-white text-sm uppercase tracking-[0.3em] font-medium mb-4 drop-shadow-md">
                  {view === 'home' ? 'Autumn / Winter Collection' : `${view.toUpperCase()} EXCLUSIVE`}
                </h2>
                <h1 className="text-white text-5xl md:text-8xl font-display font-bold mb-8 drop-shadow-lg">
                  {heroTitles[view]}
                </h1>
                <button 
                  onClick={handleHeroAction}
                  className="bg-white text-zinc-900 px-8 py-4 rounded-full font-bold flex items-center space-x-2 hover:bg-zinc-100 transition-all shadow-2xl"
                >
                  <span>Explore Collection</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </section>

            {/* Product Grid */}
            <section id="collection-header" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                <div>
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 block">
                    {view === 'home' ? 'Latest Arrivals' : `${view} Selection`}
                  </span>
                  <h2 className="text-4xl font-display font-bold text-zinc-900">
                    {view === 'home' ? 'Featured Curations' : `${view.charAt(0).toUpperCase() + view.slice(1)}'s Wardrobe`}
                  </h2>
                </div>
                <div className="flex space-x-8 text-sm font-medium border-b border-zinc-100 pb-2 overflow-x-auto whitespace-nowrap">
                  <button onClick={() => setView('home')} className={`pb-2 ${view === 'home' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-400 hover:text-zinc-600 transition-colors'}`}>All Items</button>
                  <button onClick={() => setView('men')} className={`pb-2 ${view === 'men' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-400 hover:text-zinc-600 transition-colors'}`}>Men</button>
                  <button onClick={() => setView('women')} className={`pb-2 ${view === 'women' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-400 hover:text-zinc-600 transition-colors'}`}>Women</button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-32">
                  <Loader2 className="animate-spin text-zinc-300" size={48} />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-32 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">No Items Found</h3>
                  <p className="text-zinc-500 max-w-xs mx-auto">Our {view} collection is currently being updated.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                  {products.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={() => addToCart(product)} 
                      onRefresh={loadCatalog}
                      onViewDetail={() => openProductDetail(product.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Benefits Section */}
        <section className="py-24 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Global Delivery', desc: 'Complimentary shipping on orders over $500 with insurance.' },
              { title: 'Secure Transactions', desc: 'Enterprise grade security for every purchase you make.' },
              { title: 'Personal Stylist', desc: 'Access our AI-powered stylist for advice anytime.' },
            ].map((b, i) => (
              <div key={i} className="text-center group">
                <div className="w-12 h-1 px-4 bg-zinc-300 mx-auto mb-6 group-hover:bg-zinc-900 transition-colors duration-500" />
                <h3 className="text-lg font-bold mb-3 uppercase tracking-widest">{b.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-zinc-100 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-display font-bold mb-6">DENIVO</h2>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">Redefining modern elegance through timeless designs and sustainable practices. Established 2024.</p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6">Shop</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><button onClick={() => setView('home')} className="hover:text-zinc-900 transition-colors text-left">New Arrivals</button></li>
              <li><button onClick={() => setView('men')} className="hover:text-zinc-900 transition-colors text-left">Men</button></li>
              <li><button onClick={() => setView('women')} className="hover:text-zinc-900 transition-colors text-left">Women</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">About Denivo</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Journal</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6">Stay Inspired</h4>
            <p className="text-zinc-500 text-sm mb-4">Subscribe to our newsletter for exclusive collections.</p>
            <div className="flex">
              <input type="email" placeholder="Email address" className="bg-zinc-100 px-4 py-3 flex-1 text-sm outline-none focus:ring-1 focus:ring-zinc-900" />
              <button className="bg-zinc-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Join</button>
            </div>
          </div>
        </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AIAssistant products={products} />

      {/* Product Detail Page */}
      {selectedProductId && (
        <ProductDetailPage
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onAddToCart={addToCart}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Checkout Page */}
      {showCheckout && (
        <CheckoutPage
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onOrderComplete={handleOrderComplete}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}
    </div>
  );
};

export default App;
