
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Heart, Star, Package, 
  Truck, Shield, Ruler, Minus, Plus, ShoppingBag, 
  Check, Loader2, X, Play 
} from 'lucide-react';
import { FullProduct, CartItem, Product } from '../types';
import { fetchFullProduct, isInWishlist, addToWishlist, removeFromWishlist, getCurrentUser } from '../services/supabase';

interface ProductDetailPageProps {
  productId: string;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string) => void;
  onOpenAuth: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onClose, onAddToCart, onOpenAuth }) => {
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(10);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    loadProduct();
    checkAuth();
  }, [productId]);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    setIsUser(!!user);
    if (user) {
      const inWishlist = await isInWishlist(productId);
      setIsFavorite(inWishlist);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    const data = await fetchFullProduct(productId);
    setProduct(data);
    if (data?.sizes.length) {
      setSelectedSize(data.sizes[0].size_value);
    }
    setLoading(false);
  };

  const toggleFavorite = async () => {
    if (!isUser) {
      onOpenAuth();
      return;
    }
    try {
      if (isFavorite) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleAddToBag = () => {
    if (!isUser) {
      onOpenAuth();
      return;
    }
    if (product) {
      onAddToCart(product, quantity, selectedSize || undefined);
    }
  };

  const handleBulkOrder = () => {
    if (!isUser) {
      onOpenAuth();
      return;
    }
    if (product) {
      onAddToCart(product, bulkQuantity, selectedSize || undefined);
      setShowBulkModal(false);
    }
  };

  const getBulkDiscount = (qty: number): number => {
    if (!product?.bulk_pricing.length) return 0;
    const tier = product.bulk_pricing.find(
      bp => qty >= bp.min_quantity && (!bp.max_quantity || qty <= bp.max_quantity)
    );
    return tier?.discount_percent || 0;
  };

  const getBulkPrice = (qty: number): number => {
    if (!product) return 0;
    const discount = getBulkDiscount(qty);
    return product.price * qty * (1 - discount / 100);
  };

  // Build image gallery
  const allImages = product ? [
    product.image_url,
    ...product.images.map(img => img.image_url)
  ] : [];

  if (loading) {
    return (
      <div className="fixed inset-0 z-[80] bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-zinc-900" size={40} />
          <p className="text-zinc-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="fixed inset-0 z-[80] bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Product not found</p>
          <button onClick={onClose} className="text-zinc-900 font-bold underline">Go Back</button>
        </div>
      </div>
    );
  }

  const discount = getBulkDiscount(bulkQuantity);

  return (
    <div className="fixed inset-0 z-[80] bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="flex items-center space-x-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Collection</span>
          </button>
          <h1 className="text-xl font-display font-bold tracking-tighter">DENIVO</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pb-2 lg:pb-0 lg:pr-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-20 lg:w-20 lg:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-zinc-900' 
                      : 'border-transparent hover:border-zinc-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative aspect-[3/4] bg-zinc-100 rounded-2xl overflow-hidden group">
              {product.details?.is_highly_rated && (
                <div className="absolute top-4 left-4 z-10 bg-white px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg">
                  <Star size={14} className="fill-zinc-900 text-zinc-900" />
                  <span className="text-xs font-bold">Highly Rated</span>
                </div>
              )}
              
              <img 
                src={allImages[selectedImageIndex] || product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                    className="absolute left-4 bottom-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 bottom-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Materials Badge */}
            {product.details?.materials && (
              <p className="text-sm font-medium text-orange-600">{product.details.materials}</p>
            )}

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 mb-1">{product.name}</h1>
              <p className="text-zinc-500 mb-4">{product.details?.short_description || product.description}</p>
              <p className="text-2xl font-bold text-zinc-900">${product.price.toFixed(2)}</p>
            </div>

            {/* Color Variants */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-zinc-900 mb-3">Color</p>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color.id}
                      className="w-12 h-12 rounded-lg border-2 border-zinc-200 overflow-hidden hover:border-zinc-900 transition-all"
                      title={color.color_name}
                    >
                      {color.image_url ? (
                        <img src={color.image_url} alt={color.color_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: color.color_hex }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-zinc-900">Select Size</p>
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center space-x-1 transition-colors"
                  >
                    <Ruler size={14} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size.id}
                      disabled={!size.is_available || size.stock === 0}
                      onClick={() => setSelectedSize(size.size_value)}
                      className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size.size_value
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : size.is_available && size.stock > 0
                            ? 'border-zinc-200 hover:border-zinc-900 text-zinc-900'
                            : 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {size.size_label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Default sizes if none in database */}
            {product.sizes.length === 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-zinc-900">Select Size</p>
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center space-x-1 transition-colors"
                  >
                    <Ruler size={14} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 hover:border-zinc-900 text-zinc-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-zinc-900 mb-3">Quantity</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-zinc-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-zinc-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-3 hover:bg-zinc-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-sm text-zinc-500">{product.stock} in stock</p>
              </div>
            </div>

            {/* Add to Bag & Favorite */}
            <div className="space-y-3">
              <button
                onClick={handleAddToBag}
                className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-zinc-800 transition-all active:scale-[0.98]"
              >
                <ShoppingBag size={20} />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={toggleFavorite}
                className={`w-full border py-4 rounded-full font-medium flex items-center justify-center space-x-2 transition-all ${
                  isFavorite 
                    ? 'border-red-200 bg-red-50 text-red-600' 
                    : 'border-zinc-200 text-zinc-900 hover:border-zinc-900'
                }`}
              >
                <Heart size={20} className={isFavorite ? 'fill-red-500' : ''} />
                <span>{isFavorite ? 'Saved to Favorites' : 'Favorite'}</span>
              </button>
            </div>

            {/* Bulk Order */}
            {product.bulk_pricing.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="w-full border-2 border-dashed border-zinc-300 py-4 rounded-xl text-zinc-600 font-medium hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center space-x-2"
              >
                <Package size={20} />
                <span>Buy in Bulk - Save up to {Math.max(...product.bulk_pricing.map(b => b.discount_percent))}%</span>
              </button>
            )}

            {/* Product Details */}
            {product.details?.long_description && (
              <div className="pt-6 border-t border-zinc-100">
                <h3 className="font-bold text-zinc-900 mb-3">Product Details</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{product.details.long_description}</p>
              </div>
            )}

            {/* Features */}
            {product.details?.features && product.details.features.length > 0 && (
              <div className="pt-4">
                <h3 className="font-bold text-zinc-900 mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.details.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-zinc-600">
                      <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Care Instructions */}
            {product.details?.care_instructions && (
              <div className="pt-4">
                <h3 className="font-bold text-zinc-900 mb-2">Care</h3>
                <p className="text-zinc-600 text-sm">{product.details.care_instructions}</p>
              </div>
            )}

            {/* Shipping & Returns */}
            <div className="pt-6 border-t border-zinc-100 space-y-4">
              <div className="flex items-center space-x-3 text-sm text-zinc-600">
                <Truck size={18} />
                <span>Free shipping on orders over $500</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-zinc-600">
                <Shield size={18} />
                <span>Free returns within 30 days</span>
              </div>
            </div>

            {/* Rating */}
            {product.details?.rating > 0 && (
              <div className="pt-4 border-t border-zinc-100">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.floor(product.details!.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.details.rating}</span>
                  <span className="text-sm text-zinc-400">({product.details.review_count} reviews)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <button 
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6">Size Guide</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-3 text-left font-bold">Size</th>
                  <th className="py-3 text-left font-bold">Chest (in)</th>
                  <th className="py-3 text-left font-bold">Waist (in)</th>
                  <th className="py-3 text-left font-bold">Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: 'XS', chest: '32-34', waist: '26-28', hip: '34-36' },
                  { size: 'S', chest: '34-36', waist: '28-30', hip: '36-38' },
                  { size: 'M', chest: '38-40', waist: '32-34', hip: '40-42' },
                  { size: 'L', chest: '42-44', waist: '36-38', hip: '44-46' },
                  { size: 'XL', chest: '46-48', waist: '40-42', hip: '48-50' },
                  { size: 'XXL', chest: '50-52', waist: '44-46', hip: '52-54' },
                ].map(row => (
                  <tr key={row.size} className="border-b border-zinc-100">
                    <td className="py-3 font-medium">{row.size}</td>
                    <td className="py-3 text-zinc-600">{row.chest}</td>
                    <td className="py-3 text-zinc-600">{row.waist}</td>
                    <td className="py-3 text-zinc-600">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Order Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBulkModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <button 
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="flex items-center space-x-3 mb-6">
              <Package size={24} className="text-zinc-900" />
              <h2 className="text-2xl font-bold">Bulk Order</h2>
            </div>

            <p className="text-zinc-600 mb-6">Order in larger quantities and save more!</p>

            {/* Pricing Tiers */}
            <div className="space-y-2 mb-6">
              {product.bulk_pricing.map(tier => (
                <div key={tier.id} className="flex justify-between items-center py-2 px-3 bg-zinc-50 rounded-lg">
                  <span className="text-sm">
                    {tier.min_quantity}+ units
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {tier.discount_percent}% OFF
                  </span>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-sm font-medium text-zinc-900 mb-2 block">Quantity</label>
              <div className="flex items-center border border-zinc-200 rounded-lg w-fit">
                <button
                  onClick={() => setBulkQuantity(q => Math.max(1, q - 5))}
                  className="p-3 hover:bg-zinc-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-3 font-medium outline-none"
                />
                <button
                  onClick={() => setBulkQuantity(q => q + 5)}
                  className="p-3 hover:bg-zinc-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-zinc-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-600">Unit Price</span>
                <span>${product.price.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span>Bulk Discount</span>
                  <span>-{discount}%</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-zinc-200 font-bold text-lg">
                <span>Total</span>
                <span>${getBulkPrice(bulkQuantity).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  You save ${(product.price * bulkQuantity - getBulkPrice(bulkQuantity)).toFixed(2)}!
                </p>
              )}
            </div>

            <button
              onClick={handleBulkOrder}
              className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold hover:bg-zinc-800 transition-all"
            >
              Add {bulkQuantity} Items to Bag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
