
import React from 'react';
import { Product } from '../types';
import { Plus, Trash2, Eye } from 'lucide-react';
import { getCurrentUser, deleteProduct } from '../services/supabase';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onRefresh?: () => void;
  onViewDetail?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onRefresh, onViewDetail }) => {
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    getCurrentUser().then(user => {
      setIsAdmin(user?.email === 'tzkusman786@gmail.com');
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await deleteProduct(product.id);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleClick = () => {
    if (onViewDetail) {
      onViewDetail();
    }
  };

  return (
    <div className="group relative cursor-pointer" onClick={handleClick}>
      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-zinc-100 mb-4 relative">
        <img
          src={product.image_url || `https://picsum.photos/seed/${product.id}/600/800`}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-zinc-900 flex items-center space-x-2">
            <Eye size={16} />
            <span>Quick View</span>
          </span>
        </div>
        
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {isAdmin && (
            <button 
              onClick={handleDelete}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-zinc-900 hover:text-white transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 uppercase tracking-wide">{product.name}</h3>
          <p className="mt-1 text-xs text-zinc-500 font-medium italic">{product.category}</p>
        </div>
        <p className="text-sm font-semibold text-zinc-900">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
