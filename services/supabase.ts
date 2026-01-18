
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { SupabaseConfig, Product, ProductImage, ProductSize, ProductDetails, BulkPricing, ProductColor, FullProduct, Order, OrderItem, CartItem, CheckoutFormData } from '../types';

// Use environment variables for Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that keys are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase environment variables are not set. Please check your .env file.');
}

// Lazy initialize Supabase client
let supabase: SupabaseClient | null = null;

const initializeSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      throw error;
    }
  }
  return supabase;
};

export const getSupabaseClient = (): SupabaseClient => initializeSupabaseClient();

// --- Auth Methods ---
export const signUp = async (email: string, password: string, fullName: string) => {
  return await getSupabaseClient().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: window.location.origin,
    }
  });
};

export const signIn = async (email: string, password: string) => {
  return await getSupabaseClient().auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  await getSupabaseClient().auth.signOut();
};

export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await getSupabaseClient().auth.getSession();
  return session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await getSupabaseClient().auth.getUser();
  return user;
};

export const onAuthChange = (callback: (user: User | null, session: Session | null) => void) => {
  const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });
  return () => subscription.unsubscribe();
};

// --- Product Methods ---
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await getSupabaseClient().from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .select('*')
    .ilike('category', category)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Error fetching ${category} products:`, error);
    return [];
  }
  return data || [];
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .insert([product])
    .select();
    
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>) => {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error, count } = await getSupabaseClient()
    .from('products')
    .delete({ count: 'exact' })
    .eq('id', id);
    
  if (error) {
    console.error('Supabase Delete Error:', error);
    throw error;
  }
  
  if (count === 0) {
    throw new Error("Action Blocked: The database accepted the request but deleted 0 rows. This is usually due to Row Level Security (RLS). Please ensure you have run the 'Admin Full Control' SQL query and are logged in as tzkusman786@gmail.com.");
  }
  
  return true;
};

export const deleteAllProducts = async () => {
  const { error, count } = await getSupabaseClient()
    .from('products')
    .delete({ count: 'exact' })
    .filter('id', 'not.is', null);
    
  if (error) {
    console.error('Supabase Bulk Delete Error:', error);
    throw error;
  }
  
  if (count === 0) {
    throw new Error("Action Blocked: No products were deleted. Check your RLS policies for tzkusman786@gmail.com.");
  }
  
  return true;
};

export const initializeSupabase = (config: SupabaseConfig) => {
  supabase = createClient(config.url, config.anonKey);
  return true;
};

// --- Product Detail Methods ---
export const fetchProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
};

export const fetchProductImages = async (productId: string): Promise<ProductImage[]> => {
  const { data, error } = await getSupabaseClient()
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching product images:', error);
    return [];
  }
  return data || [];
};

export const fetchProductSizes = async (productId: string): Promise<ProductSize[]> => {
  const { data, error } = await getSupabaseClient()
    .from('product_sizes')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching product sizes:', error);
    return [];
  }
  return data || [];
};

export const fetchProductDetails = async (productId: string): Promise<ProductDetails | null> => {
  const { data, error } = await getSupabaseClient()
    .from('product_details')
    .select('*')
    .eq('product_id', productId)
    .single();
    
  if (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
  return data;
};

export const fetchBulkPricing = async (productId: string): Promise<BulkPricing[]> => {
  const { data, error } = await getSupabaseClient()
    .from('bulk_pricing')
    .select('*')
    .eq('product_id', productId)
    .order('min_quantity', { ascending: true });
    
  if (error) {
    console.error('Error fetching bulk pricing:', error);
    return [];
  }
  return data || [];
};

export const fetchProductColors = async (productId: string): Promise<ProductColor[]> => {
  const { data, error } = await getSupabaseClient()
    .from('product_colors')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching product colors:', error);
    return [];
  }
  return data || [];
};

export const fetchFullProduct = async (id: string): Promise<FullProduct | null> => {
  const product = await fetchProductById(id);
  if (!product) return null;
  
  const [images, sizes, details, bulk_pricing, colors] = await Promise.all([
    fetchProductImages(id),
    fetchProductSizes(id),
    fetchProductDetails(id),
    fetchBulkPricing(id),
    fetchProductColors(id)
  ]);
  
  return {
    ...product,
    images,
    sizes,
    details,
    bulk_pricing,
    colors
  };
};

// --- Wishlist Methods ---
export const addToWishlist = async (productId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in');
  
  const { error } = await getSupabaseClient()
    .from('wishlist')
    .insert([{ user_id: user.id, product_id: productId }]);
    
  if (error) throw error;
  return true;
};

export const removeFromWishlist = async (productId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in');
  
  const { error } = await getSupabaseClient()
    .from('wishlist')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);
    
  if (error) throw error;
  return true;
};

export const isInWishlist = async (productId: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data } = await getSupabaseClient()
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();
    
  return !!data;
};

export const fetchUserWishlist = async (): Promise<Product[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data, error } = await getSupabaseClient()
    .from('wishlist')
    .select('product_id, products(*)')
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
  
  return data?.map((item: any) => item.products).filter(Boolean) || [];
};

// --- Admin: Add Product with Details ---
export const addProductWithDetails = async (
  product: Omit<Product, 'id'>,
  details?: Partial<Omit<ProductDetails, 'id' | 'product_id'>>,
  sizes?: Partial<Omit<ProductSize, 'id' | 'product_id'>>[],
  images?: Partial<Omit<ProductImage, 'id' | 'product_id'>>[],
  bulkPricing?: Partial<Omit<BulkPricing, 'id' | 'product_id'>>[]
) => {
  const { data: productData, error: productError } = await getSupabaseClient()
    .from('products')
    .insert([product])
    .select()
    .single();
    
  if (productError) throw productError;
  
  const productId = productData.id;
  
  if (details) {
    await getSupabaseClient()
      .from('product_details')
      .insert([{ ...details, product_id: productId }]);
  }
  
  if (sizes && sizes.length > 0) {
    await getSupabaseClient()
      .from('product_sizes')
      .insert(sizes.map(s => ({ ...s, product_id: productId })));
  }
  
  if (images && images.length > 0) {
    await getSupabaseClient()
      .from('product_images')
      .insert(images.map(i => ({ ...i, product_id: productId })));
  }
  
  if (bulkPricing && bulkPricing.length > 0) {
    await getSupabaseClient()
      .from('bulk_pricing')
      .insert(bulkPricing.map(b => ({ ...b, product_id: productId })));
  }
  
  return productData;
};

export const updateProductDetails = async (productId: string, details: Partial<Omit<ProductDetails, 'id' | 'product_id'>>) => {
  const { data, error } = await getSupabaseClient()
    .from('product_details')
    .upsert([{ ...details, product_id: productId }])
    .select();
    
  if (error) throw error;
  return data;
};

export const addProductSize = async (productId: string, size: Partial<Omit<ProductSize, 'id' | 'product_id'>>) => {
  const { data, error } = await getSupabaseClient()
    .from('product_sizes')
    .insert([{ ...size, product_id: productId }])
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteProductSize = async (sizeId: string) => {
  const { error } = await getSupabaseClient()
    .from('product_sizes')
    .delete()
    .eq('id', sizeId);
    
  if (error) throw error;
  return true;
};

export const addProductImage = async (productId: string, image: Partial<Omit<ProductImage, 'id' | 'product_id'>>) => {
  const { data, error } = await getSupabaseClient()
    .from('product_images')
    .insert([{ ...image, product_id: productId }])
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteProductImage = async (imageId: string) => {
  const { error } = await getSupabaseClient()
    .from('product_images')
    .delete()
    .eq('id', imageId);
    
  if (error) throw error;
  return true;
};

export const addBulkPricing = async (productId: string, pricing: Partial<Omit<BulkPricing, 'id' | 'product_id'>>) => {
  const { data, error } = await getSupabaseClient()
    .from('bulk_pricing')
    .insert([{ ...pricing, product_id: productId }])
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteBulkPricing = async (pricingId: string) => {
  const { error } = await getSupabaseClient()
    .from('bulk_pricing')
    .delete()
    .eq('id', pricingId);
    
  if (error) throw error;
  return true;
};

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user_email?: string;
}

export const fetchProductReviews = async (productId: string): Promise<ProductReview[]> => {
  const { data, error } = await getSupabaseClient()
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data || [];
};

export const addProductReview = async (
  productId: string,
  rating: number,
  title: string,
  reviewText: string
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in to review');
  
  const { data, error } = await getSupabaseClient()
    .from('product_reviews')
    .insert([{
      product_id: productId,
      user_id: user.id,
      rating,
      title,
      review_text: reviewText
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateProductReview = async (
  reviewId: string,
  rating: number,
  title: string,
  reviewText: string
) => {
  const { data, error } = await getSupabaseClient()
    .from('product_reviews')
    .update({
      rating,
      title,
      review_text: reviewText,
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteProductReview = async (reviewId: string) => {
  const { error } = await getSupabaseClient()
    .from('product_reviews')
    .delete()
    .eq('id', reviewId);
    
  if (error) throw error;
  return true;
};

export const getUserReviewForProduct = async (productId: string): Promise<ProductReview | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await getSupabaseClient()
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single();
    
  if (error) return null;
  return data;
};

export const markReviewHelpful = async (reviewId: string) => {
  const { error } = await getSupabaseClient().rpc('increment_helpful_count', { review_id: reviewId });
  if (error) throw error;
  return true;
};

const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DNV-${dateStr}-${random}`;
};

export const createOrder = async (
  cartItems: CartItem[],
  formData: CheckoutFormData,
  subtotal: number,
  shippingCost: number = 0,
  taxAmount: number = 0,
  discountAmount: number = 0
): Promise<Order> => {
  const user = await getCurrentUser();
  const orderNumber = generateOrderNumber();
  const total = subtotal + shippingCost + taxAmount - discountAmount;

  const { data: orderData, error: orderError } = await getSupabaseClient()
    .from('orders')
    .insert([{
      order_number: orderNumber,
      user_id: user?.id || null,
      status: 'pending',
      payment_method: formData.paymentMethod,
      payment_status: formData.paymentMethod === 'cod' ? 'pending' : 'pending',
      customer_email: formData.email,
      customer_name: formData.fullName,
      customer_phone: formData.phone,
      shipping_address: formData.address,
      shipping_city: formData.city,
      shipping_state: formData.state,
      shipping_zip: formData.zip,
      shipping_country: formData.country,
      subtotal,
      discount_amount: discountAmount,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      total,
      order_notes: formData.orderNotes
    }])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = cartItems.map(item => ({
    order_id: orderData.id,
    product_id: item.id,
    product_name: item.name,
    product_image: item.image_url,
    quantity: item.quantity,
    size: item.selectedSize || null,
    unit_price: item.price,
    total_price: item.price * item.quantity
  }));

  const { error: itemsError } = await getSupabaseClient()
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
};

export const fetchUserOrders = async (): Promise<Order[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await getSupabaseClient()
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data || [];
};

export const fetchOrderById = async (orderId: string): Promise<Order | null> => {
  const { data, error } = await getSupabaseClient()
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data;
};

export const fetchOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  const { data, error } = await getSupabaseClient()
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data;
};

export const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await getSupabaseClient()
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
  return data || [];
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order | null> => {
  const { data, error } = await getSupabaseClient()
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status']): Promise<Order | null> => {
  const { data, error } = await getSupabaseClient()
    .from('orders')
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await getSupabaseClient()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
  return data || [];
};

// EmailJS Configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendOrderConfirmationEmail = async (order: Order, items: OrderItem[]): Promise<boolean> => {
  try {
    const ordersArray = items.map(item => ({
      name: `${item.product_name}${item.size ? ` (${item.size})` : ''}`,
      price: `Rs. ${Number(item.total_price).toLocaleString()}`,
      units: item.quantity
    }));

    const templateParams = {
      to_email: order.customer_email,
      email: order.customer_email,
      order_id: order.order_number,
      customer_name: order.customer_name,
      orders: ordersArray,
      cost: {
        shipping: `Rs. ${Number(order.shipping_cost || 0).toLocaleString()}`,
        tax: `Rs. ${Number(order.tax_amount || 0).toLocaleString()}`
      },
      total: `Rs. ${Number(order.total).toLocaleString()}`,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state || '',
      shipping_zip: order.shipping_zip,
      payment_method: order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return true;
  } catch (err) {
    console.error('Error sending email:', err);
    return false;
  }
};

export const sendOrderStatusEmail = async (order: Order, newStatus: string): Promise<boolean> => {
  try {
    const statusMessages: Record<string, string> = {
      'confirmed': 'Your order has been confirmed and is being prepared!',
      'shipped': 'Your order has been shipped and is on its way!',
      'delivered': 'Your order has been delivered. Thank you!',
      'cancelled': 'Your order has been cancelled.'
    };

    const templateParams = {
      to_email: order.customer_email,
      email: order.customer_email,
      order_id: order.order_number,
      customer_name: order.customer_name,
      orders: [{ name: statusMessages[newStatus] || `Order ${newStatus}`, price: '', units: '' }],
      cost: {
        shipping: `Rs. ${Number(order.shipping_cost || 0).toLocaleString()}`,
        tax: `Rs. ${Number(order.tax_amount || 0).toLocaleString()}`
      },
      total: `Rs. ${Number(order.total).toLocaleString()}`,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state || '',
      shipping_zip: order.shipping_zip,
      payment_method: order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return true;
  } catch (err) {
    console.error('Error sending status email:', err);
    return false;
  }
};
