
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
  selectedSize?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// New types for product detail system
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size_label: string;
  size_value: string;
  stock: number;
  is_available: boolean;
  display_order: number;
}

export interface ProductDetails {
  id: string;
  product_id: string;
  short_description: string;
  long_description: string;
  materials: string;
  care_instructions: string;
  features: string[];
  is_highly_rated: boolean;
  rating: number;
  review_count: number;
  sku: string;
  brand: string;
}

export interface BulkPricing {
  id: string;
  product_id: string;
  min_quantity: number;
  max_quantity: number | null;
  discount_percent: number;
  price_per_unit: number | null;
}

export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  image_url: string;
  display_order: number;
}

export interface FullProduct extends Product {
  images: ProductImage[];
  sizes: ProductSize[];
  details: ProductDetails | null;
  bulk_pricing: BulkPricing[];
  colors: ProductColor[];
}

// Order System Types
export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'cod' | 'online';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  order_notes: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  quantity: number;
  size: string | null;
  unit_price: number;
  total_price: number;
}

export interface CheckoutFormData {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  paymentMethod: 'cod' | 'online';
  orderNotes: string;
}
