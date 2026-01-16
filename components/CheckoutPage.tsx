import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, CreditCard, Truck, Package, Shield, 
  Check, Loader2, MapPin, User, Mail, Phone, FileText,
  Banknote, CheckCircle2, AlertCircle
} from 'lucide-react';
import { CartItem, CheckoutFormData, Order } from '../types';
import { createOrder, getCurrentUser } from '../services/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface CheckoutPageProps {
  cart: CartItem[];
  onClose: () => void;
  onOrderComplete: (order: Order) => void;
  onOpenAuth: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, onClose, onOrderComplete, onOpenAuth }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    paymentMethod: 'cod',
    orderNotes: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || '',
        fullName: currentUser.user_metadata?.full_name || ''
      }));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 500 ? 0 : 25;
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateShipping = (): boolean => {
    if (!formData.email || !formData.fullName || !formData.address || !formData.city || !formData.zip) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const order = await createOrder(
        cart,
        formData,
        subtotal,
        shippingCost,
        taxAmount,
        0 // discount
      );

      setCompletedOrder(order);
      setOrderComplete(true);
      onOrderComplete(order);
    } catch (err: any) {
      console.error('Order error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Order Complete Screen
  if (orderComplete && completedOrder) {
    return (
      <div className="fixed inset-0 z-[80] bg-white overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Order Confirmed!</h1>
            <p className="text-zinc-500 mb-6">Thank you for your purchase</p>
            
            <div className="bg-zinc-50 rounded-2xl p-6 mb-6 text-left">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-200">
                <span className="text-sm text-zinc-500">Order Number</span>
                <span className="font-bold text-zinc-900">{completedOrder.order_number}</span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment Method</span>
                  <span className="font-medium">
                    {completedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shipping To</span>
                  <span className="font-medium text-right">
                    {completedOrder.shipping_city}, {completedOrder.shipping_state}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-zinc-200">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">${completedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {completedOrder.payment_method === 'cod' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start space-x-3">
                  <Banknote className="text-amber-600 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-amber-800">Cash on Delivery</p>
                    <p className="text-sm text-amber-700">Please keep ${completedOrder.total.toFixed(2)} ready when your order arrives.</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-zinc-500 mb-6">
              A confirmation email has been sent to <strong>{completedOrder.customer_email}</strong>
            </p>

            <button
              onClick={onClose}
              className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold hover:bg-zinc-800 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-zinc-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="flex items-center space-x-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Cart</span>
          </button>
          <h1 className="text-xl font-display font-bold tracking-tighter">DENIVO</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            {['shipping', 'payment', 'confirm'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center space-x-2 ${
                  step === s ? 'text-zinc-900' : 
                  ['shipping', 'payment', 'confirm'].indexOf(step) > i ? 'text-green-600' : 'text-zinc-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === s ? 'bg-zinc-900 text-white' :
                    ['shipping', 'payment', 'confirm'].indexOf(step) > i ? 'bg-green-600 text-white' : 'bg-zinc-200'
                  }`}>
                    {['shipping', 'payment', 'confirm'].indexOf(step) > i ? <Check size={16} /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block capitalize">{s}</span>
                </div>
                {i < 2 && <div className={`w-12 h-0.5 ${
                  ['shipping', 'payment', 'confirm'].indexOf(step) > i ? 'bg-green-600' : 'bg-zinc-200'
                }`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Guest/Login Notice */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start space-x-3">
                <User className="text-blue-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    <strong>Checking out as guest.</strong> 
                    <button onClick={onOpenAuth} className="underline ml-1 hover:no-underline">
                      Sign in
                    </button> to track your orders and earn rewards.
                  </p>
                </div>
              </div>
            )}

            {/* Shipping Step */}
            {step === 'shipping' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <MapPin size={20} />
                  <span>Shipping Information</span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none"
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zip"
                        required
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none"
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none bg-white"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/10 outline-none resize-none"
                      placeholder="Special delivery instructions..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700">
                    <AlertCircle size={18} className="mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleContinueToPayment}
                  className="w-full mt-6 bg-zinc-900 text-white py-4 rounded-full font-bold hover:bg-zinc-800 transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <CreditCard size={20} />
                  <span>Payment Method</span>
                </h2>

                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod' 
                      ? 'border-zinc-900 bg-zinc-50' 
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Banknote size={20} className="text-green-600" />
                          <span className="font-bold">Cash on Delivery</span>
                        </div>
                        <p className="text-sm text-zinc-500 mt-1">
                          Pay with cash when your order is delivered to your doorstep.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Online Payment */}
                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === 'online' 
                      ? 'border-zinc-900 bg-zinc-50' 
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={formData.paymentMethod === 'online'}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CreditCard size={20} className="text-blue-600" />
                          <span className="font-bold">Pay Online</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Secure</span>
                        </div>
                        <p className="text-sm text-zinc-500 mt-1">
                          Pay securely with credit card, debit card, or digital wallet.
                        </p>
                        {formData.paymentMethod === 'online' && (
                          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                              <strong>Note:</strong> Online payment integration coming soon. 
                              Please use Cash on Delivery for now.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setStep('shipping')}
                    className="flex-1 border border-zinc-300 text-zinc-700 py-4 rounded-full font-bold hover:border-zinc-900 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={formData.paymentMethod === 'online'}
                    className="flex-1 bg-zinc-900 text-white py-4 rounded-full font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Step */}
            {step === 'confirm' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <FileText size={20} />
                  <span>Review Your Order</span>
                </h2>

                {/* Shipping Summary */}
                <div className="border border-zinc-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-zinc-900">Shipping To</h3>
                    <button onClick={() => setStep('shipping')} className="text-sm text-blue-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-zinc-600">{formData.fullName}</p>
                  <p className="text-sm text-zinc-600">{formData.address}</p>
                  <p className="text-sm text-zinc-600">{formData.city}, {formData.state} {formData.zip}</p>
                  <p className="text-sm text-zinc-600">{formData.country}</p>
                  <p className="text-sm text-zinc-500 mt-2">{formData.email}</p>
                </div>

                {/* Payment Summary */}
                <div className="border border-zinc-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-zinc-900">Payment Method</h3>
                    <button onClick={() => setStep('payment')} className="text-sm text-blue-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData.paymentMethod === 'cod' ? (
                      <>
                        <Banknote size={18} className="text-green-600" />
                        <span className="text-sm">Cash on Delivery</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} className="text-blue-600" />
                        <span className="text-sm">Online Payment</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border border-zinc-200 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-sm text-zinc-900 mb-3">Order Items ({cart.length})</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map(item => (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex space-x-3">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-16 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-zinc-500">
                            {item.selectedSize && `Size: ${item.selectedSize} • `}
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700">
                    <AlertCircle size={18} className="mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 border border-zinc-300 text-zinc-700 py-4 rounded-full font-bold hover:border-zinc-900 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-zinc-900 text-white py-4 rounded-full font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-32">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>

              {/* Cart Items Preview */}
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex space-x-3">
                    <div className="relative">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-14 h-16 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-900 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.selectedSize && (
                        <p className="text-xs text-zinc-500">Size: {item.selectedSize}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600">FREE</span> : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Tax (8%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-zinc-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 500 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700">
                    Add ${(500 - subtotal).toFixed(2)} more for <strong>FREE shipping</strong>
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-3 text-xs text-zinc-500">
                <div className="flex items-center space-x-2">
                  <Shield size={14} />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck size={14} />
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package size={14} />
                  <span>Ships in 2-5 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
