
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { SupabaseConfig, Product, ProductImage, ProductSize, ProductDetails, BulkPricing, ProductColor, FullProduct } from '../types';

// Hardcoded credentials as requested by the user
const SUPABASE_URL = 'https://aplibkzcysdothjgfqmc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jphwGPd_ZOog9XM5Hka7kA_kk285KuL';

// Ensure persistence is enabled and URL detection is active
let supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const getSupabaseClient = () => supabase;

// --- Auth Methods ---
export const signUp = async (email: string, password: string, fullName: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: window.location.origin,
    }
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthChange = (callback: (user: User | null, session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });
  return () => subscription.unsubscribe();
};

// --- Product Methods ---
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select();
    
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  // count: 'exact' ensures we know if RLS silently blocked the delete
  const { error, count } = await supabase
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
  // Standard 'delete all' pattern that avoids using banned table users
  const { error, count } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  
  const { error } = await supabase
    .from('wishlist')
    .insert([{ user_id: user.id, product_id: productId }]);
    
  if (error) throw error;
  return true;
};

export const removeFromWishlist = async (productId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in');
  
  const { error } = await supabase
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
  
  const { data } = await supabase
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
  
  const { data, error } = await supabase
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
  // Insert main product
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
    
  if (productError) throw productError;
  
  const productId = productData.id;
  
  // Insert details if provided
  if (details) {
    await supabase
      .from('product_details')
      .insert([{ ...details, product_id: productId }]);
  }
  
  // Insert sizes if provided
  if (sizes && sizes.length > 0) {
    await supabase
      .from('product_sizes')
      .insert(sizes.map(s => ({ ...s, product_id: productId })));
  }
  
  // Insert images if provided
  if (images && images.length > 0) {
    await supabase
      .from('product_images')
      .insert(images.map(i => ({ ...i, product_id: productId })));
  }
  
  // Insert bulk pricing if provided
  if (bulkPricing && bulkPricing.length > 0) {
    await supabase
      .from('bulk_pricing')
      .insert(bulkPricing.map(b => ({ ...b, product_id: productId })));
  }
  
  return productData;
};

// --- Admin: Update Product Details ---
export const updateProductDetails = async (productId: string, details: Partial<Omit<ProductDetails, 'id' | 'product_id'>>) => {
  const { data, error } = await supabase
    .from('product_details')
    .upsert([{ ...details, product_id: productId }])
    .select();
    
  if (error) throw error;
  return data;
};

// --- Admin: Manage Sizes ---
export const addProductSize = async (productId: string, size: Partial<Omit<ProductSize, 'id' | 'product_id'>>) => {
  const { data, error } = await supabase
    .from('product_sizes')
    .insert([{ ...size, product_id: productId }])
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteProductSize = async (sizeId: string) => {
  const { error } = await supabase
    .from('product_sizes')
    .delete()
    .eq('id', sizeId);
    
  if (error) throw error;
  return true;
};

// --- Admin: Manage Images ---
export const addProductImage = async (productId: string, image: Partial<Omit<ProductImage, 'id' | 'product_id'>>) => {
  const { data, error } = await supabase
    .from('product_images')
    .insert([{ ...image, product_id: productId }])
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteProductImage = async (imageId: string) => {
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);
    
  if (error) throw error;
  return true;
};

// --- Admin: Manage Bulk Pricing ---
export const addBulkPricing = async (productId: string, pricing: Partial<Omit<BulkPricing, 'id' | 'product_id'>>) => {
  const { data, error } = await supabase
    .from('bulk_pricing')
    .insert([{ ...pricing, product_id: productId }])
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteBulkPricing = async (pricingId: string) => {
  const { error } = await supabase
    .from('bulk_pricing')
    .delete()
    .eq('id', pricingId);
    
  if (error) throw error;
  return true;
};
