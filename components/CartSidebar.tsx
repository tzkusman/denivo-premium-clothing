
import React from 'react';
import { X, Trash2, ChevronRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, q: number) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-zinc-900">Your Bag</h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-500 mb-4">Your bag is currently empty.</p>
                <button 
                  onClick={onClose}
                  className="text-zinc-900 font-semibold border-b-2 border-zinc-900"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.selectedSize || index}`} className="flex space-x-4 border-b border-zinc-100 pb-6">
                    <img 
                      src={item.image_url || `https://picsum.photos/seed/${item.id}/200/200`} 
                      alt={item.name} 
                      className="w-20 h-28 object-cover rounded-lg bg-zinc-100"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between font-medium text-zinc-900 mb-1">
                          <h4 className="text-sm uppercase tracking-wide">{item.name}</h4>
                          <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-zinc-500">{item.category}</p>
                        {item.selectedSize && (
                          <p className="text-xs text-zinc-700 font-medium mt-1">Size: {item.selectedSize}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 bg-zinc-50 px-2 py-1 rounded-md">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-lg font-medium w-6"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="text-lg font-medium w-6"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-100 p-6 bg-zinc-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-600 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-zinc-900">${total.toFixed(2)}</span>
            </div>
            <button className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-zinc-800 transition-all active:scale-[0.98]">
              <span>Checkout Now</span>
              <ChevronRight size={20} />
            </button>
            <p className="text-center text-xs text-zinc-400 mt-4 uppercase tracking-widest font-semibold">
              Free Shipping & Returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
