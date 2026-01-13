
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { SupabaseConfig, Product } from '../types';

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
