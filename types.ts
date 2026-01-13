
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
