
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, LogOut, ShieldCheck, X } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { signOut } from '../services/supabase';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  user: SupabaseUser | null;
  onViewChange: (view: 'home' | 'men' | 'women' | 'admin') => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, onOpenAuth, user, onViewChange, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = user?.email === 'tzkusman786@gmail.com';

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleNavClick = (view: 'home' | 'men' | 'women' | 'admin') => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Desktop Left / Mobile Menu Trigger */}
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-zinc-900 hover:bg-zinc-50 rounded-full transition-all"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              
              <div className="hidden lg:flex items-center space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                <button 
                  onClick={() => handleNavClick('men')} 
                  className={`transition-all py-2 hover:text-zinc-900 ${currentView === 'men' ? 'text-zinc-900 border-b-2 border-zinc-900' : ''}`}
                >
                  Men
                </button>
                <button 
                  onClick={() => handleNavClick('women')} 
                  className={`transition-all py-2 hover:text-zinc-900 ${currentView === 'women' ? 'text-zinc-900 border-b-2 border-zinc-900' : ''}`}
                >
                  Women
                </button>
                <button 
                  onClick={() => handleNavClick('home')} 
                  className={`transition-all py-2 hover:text-zinc-900 ${currentView === 'home' ? 'text-zinc-900 border-b-2 border-zinc-900' : ''}`}
                >
                  Collection
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => handleNavClick('admin')} 
                    className={`flex items-center space-x-2 transition-all py-2 ${currentView === 'admin' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-400 hover:text-zinc-900 italic font-black'}`}
                  >
                    <ShieldCheck size={14} />
                    <span>Admin</span>
                  </button>
                )}
              </div>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <button onClick={() => handleNavClick('home')} className="focus:outline-none">
                <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tighter text-zinc-900">DENIVO</h1>
              </button>
            </div>

            {/* Desktop Right Tools */}
            <div className="flex items-center space-x-1 md:space-x-4">
              <button className="hidden sm:flex p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all">
                <Search size={22} />
              </button>
              
              <div className="relative group">
                <button 
                  onClick={user ? undefined : onOpenAuth}
                  className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all flex items-center space-x-2"
                >
                  <User size={22} />
                  {user && (
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                      {user.user_metadata?.full_name?.split(' ')[0] || 'Member'}
                    </span>
                  )}
                </button>
                
                {user && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-zinc-100 shadow-2xl rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="px-5 py-3 border-b border-zinc-50 mb-2">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold mb-1">Authenticated Account</p>
                      <p className="text-sm font-bold truncate text-zinc-900">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => signOut()}
                      className="w-full text-left px-5 py-3 text-sm text-zinc-600 hover:bg-red-50 hover:text-red-600 flex items-center space-x-3 transition-colors"
                    >
                      <LogOut size={16} />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={onOpenCart}
                className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all relative"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-zinc-900 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer UI */}
      <div 
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMenuOpen(false)} 
        />
        
        {/* Sidebar Panel */}
        <div 
          className={`absolute inset-y-0 left-0 w-full max-w-[320px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 flex justify-between items-center border-b border-zinc-50">
              <h2 className="text-xl font-display font-black tracking-tighter text-zinc-900">DENIVO</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain py-10 px-8 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="space-y-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-6">Collections</p>
                  <div className="flex flex-col space-y-6">
                    <button 
                      onClick={() => handleNavClick('men')}
                      className={`text-3xl font-display text-left transition-all ${currentView === 'men' ? 'text-zinc-900 font-bold translate-x-2' : 'text-zinc-400'}`}
                    >
                      Men's Wear
                    </button>
                    <button 
                      onClick={() => handleNavClick('women')}
                      className={`text-3xl font-display text-left transition-all ${currentView === 'women' ? 'text-zinc-900 font-bold translate-x-2' : 'text-zinc-400'}`}
                    >
                      Women's Wear
                    </button>
                    <button 
                      onClick={() => handleNavClick('home')}
                      className={`text-3xl font-display text-left transition-all ${currentView === 'home' ? 'text-zinc-900 font-bold translate-x-2' : 'text-zinc-400'}`}
                    >
                      All Archive
                    </button>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-8 border-t border-zinc-50">
                    <button 
                      onClick={() => handleNavClick('admin')}
                      className={`flex items-center space-x-3 transition-colors ${currentView === 'admin' ? 'text-zinc-900' : 'text-zinc-400'}`}
                    >
                      <ShieldCheck size={20} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Command Center</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            {user ? (
              <div className="p-8 bg-zinc-50/50 border-t border-zinc-50">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{user.user_metadata?.full_name || 'Denivo Client'}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Premium Member</p>
                  </div>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-600 hover:border-red-100 transition-all active:scale-[0.98]"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="p-8 border-t border-zinc-50">
                <button 
                  onClick={() => { setIsMenuOpen(false); onOpenAuth(); }}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-900/10 active:scale-[0.98] transition-all"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
