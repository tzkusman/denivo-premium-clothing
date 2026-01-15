# DENIVO - Premium Clothing E-Commerce Platform
## Complete Project Documentation

> **Last Updated:** January 15, 2026  
> **Version:** 1.0.0  
> **Live Site:** https://denivo-premium-clothing.vercel.app  
> **Repository:** https://github.com/tzkusman/denivo-premium-clothing

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment & Credentials](#4-environment--credentials)
5. [Supabase Database Schema](#5-supabase-database-schema)
6. [Component Architecture](#6-component-architecture)
7. [Services Layer](#7-services-layer)
8. [Authentication Flow](#8-authentication-flow)
9. [Admin Panel Features](#9-admin-panel-features)
10. [Product Detail System](#10-product-detail-system)
11. [AI Fashion Assistant](#11-ai-fashion-assistant)
12. [Deployment Guide](#12-deployment-guide)
13. [SQL Queries Reference](#13-sql-queries-reference)
14. [Troubleshooting](#14-troubleshooting)
15. [Future Enhancements](#15-future-enhancements)

---

## 1. Project Overview

**Denivo** is a premium clothing e-commerce platform featuring:
- Nike-style product catalog with category filtering
- Product detail pages with multiple images, sizes, bulk pricing
- AI-powered fashion assistant (Google Gemini)
- Customer reviews system
- Wishlist functionality
- Shopping cart with size selection
- Admin panel for inventory management
- User authentication via Supabase

### Key Features Built:
- ✅ Product catalog with Men/Women/Accessories categories
- ✅ Product detail page with image gallery
- ✅ Size selection with individual stock levels
- ✅ Bulk ordering with volume discounts
- ✅ Customer reviews with ratings
- ✅ Wishlist/Favorites
- ✅ AI Fashion Assistant chatbot
- ✅ Admin panel with full CRUD operations
- ✅ Multiple product images support
- ✅ Responsive design

---

## 2. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.3 | Frontend framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 6.2.0 | Build tool & dev server |
| **Tailwind CSS** | (via CDN) | Styling |
| **Supabase** | 2.49.4 | Database, Auth, Storage |
| **Google Gemini AI** | 0.24.0 | AI fashion assistant |
| **Lucide React** | 0.481.0 | Icons |
| **Vercel** | - | Hosting platform |

### Package.json Dependencies:
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.0",
    "@supabase/supabase-js": "^2.49.4",
    "lucide-react": "^0.481.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "@vitejs/plugin-react": "^4.5.0",
    "typescript": "~5.8.3",
    "vite": "^6.2.0"
  }
}
```

---

## 3. Project Structure

```
denivo---premium-clothing/
├── index.html                 # Entry HTML file
├── index.tsx                  # React entry point
├── App.tsx                    # Main application component
├── types.ts                   # TypeScript interfaces
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
├── metadata.json              # Project metadata
├── README.md                  # Basic readme
├── PROJECT_DOCUMENTATION.md   # This file
│
├── components/
│   ├── AdminPanel.tsx         # Admin inventory management
│   ├── AIAssistant.tsx        # Gemini AI chatbot
│   ├── AuthModal.tsx          # Login/Signup modal
│   ├── CartSidebar.tsx        # Shopping cart drawer
│   ├── Navbar.tsx             # Navigation header
│   ├── ProductCard.tsx        # Product grid item
│   ├── ProductDetailPage.tsx  # Full product view
│   └── SupabaseSetup.tsx      # (Legacy) Setup component
│
└── services/
    ├── gemini.ts              # Google Gemini AI integration
    └── supabase.ts            # Supabase client & all DB operations
```

---

## 4. Environment & Credentials

### Supabase Configuration
```
URL: https://aplibkzcysdothjgfqmc.supabase.co
Anon Key: sb_publishable_jphwGPd_ZOog9XM5Hka7kA_kk285KuL
```

### Google Gemini API
```
API Key: AIzaSyC1WcMOOHEHnPfCb8stiRZYGurcXEx6kII
Model: gemini-2.0-flash
```

### Admin Access
```
Email: tzkusman786@gmail.com
(Only this email can add/edit/delete products)
```

### Vercel Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:
```
VITE_GEMINI_API_KEY = AIzaSyC1WcMOOHEHnPfCb8stiRZYGurcXEx6kII
```

### vite.config.ts (Environment Setup)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
});
```

---

## 5. Supabase Database Schema

### 5.1 Products Table (Main)
```sql
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Men', 'Women', 'Accessories')),
    image_url TEXT NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy: Anyone can read, only admin can modify
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

CREATE POLICY "Admin full control" ON products FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);
```

### 5.2 Product Images Table
```sql
CREATE TABLE product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admin can manage images" ON product_images FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);
```

### 5.3 Product Sizes Table
```sql
CREATE TABLE product_sizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_label TEXT NOT NULL,      -- Display: "S (4-6)"
    size_value TEXT NOT NULL,      -- Value: "S"
    stock INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Admin can manage sizes" ON product_sizes FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);
```

### 5.4 Product Details Table
```sql
CREATE TABLE product_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    short_description TEXT,
    long_description TEXT,
    materials TEXT,
    care_instructions TEXT,
    features TEXT[],               -- Array of feature strings
    sku TEXT,
    brand TEXT DEFAULT 'Denivo',
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_highly_rated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view details" ON product_details FOR SELECT USING (true);
CREATE POLICY "Admin can manage details" ON product_details FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);
```

### 5.5 Bulk Pricing Table
```sql
CREATE TABLE bulk_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,          -- NULL means unlimited
    discount_percent DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bulk_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bulk pricing" ON bulk_pricing FOR SELECT USING (true);
CREATE POLICY "Admin can manage bulk pricing" ON bulk_pricing FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);
```

### 5.6 Wishlist Table
```sql
CREATE TABLE wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON wishlist FOR ALL USING (
    auth.uid() = user_id
);
```

### 5.7 Product Colors Table
```sql
CREATE TABLE product_colors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_hex TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view colors" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Admin can manage colors" ON product_colors FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);
```

### 5.8 Product Reviews Table
```sql
CREATE TABLE product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON product_reviews FOR DELETE USING (
    auth.uid() = user_id OR auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);

-- Function for "Helpful" button
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Component Architecture

### 6.1 App.tsx (Main Application)
**Role:** Root component that manages global state and renders all other components.

**State Management:**
```typescript
const [products, setProducts] = useState<Product[]>([]);          // All products
const [cart, setCart] = useState<CartItem[]>([]);                 // Shopping cart
const [isCartOpen, setIsCartOpen] = useState(false);              // Cart sidebar visibility
const [activeCategory, setActiveCategory] = useState('All');       // Current filter
const [showAuth, setShowAuth] = useState(false);                  // Auth modal
const [showAdmin, setShowAdmin] = useState(false);                // Admin panel
const [user, setUser] = useState<User | null>(null);              // Logged-in user
const [selectedProductId, setSelectedProductId] = useState<string | null>(null); // Product detail view
```

**Key Functions:**
- `loadProducts()` - Fetches products from Supabase
- `addToCart(product, quantity, size)` - Adds item to cart with size/quantity
- `removeFromCart(productId)` - Removes item from cart
- `updateQuantity(productId, quantity)` - Updates cart item quantity

### 6.2 Navbar.tsx
**Role:** Top navigation bar with logo, category filters, and action buttons.

**Features:**
- Category tabs (All, Men, Women, Accessories)
- Search icon
- User account button (opens AuthModal)
- Cart button with item count badge
- Admin link (visible to admin user only)

### 6.3 ProductCard.tsx
**Role:** Displays individual product in the grid.

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenAuth: () => void;
  onViewDetail: (productId: string) => void;
}
```

**Features:**
- Image with hover zoom effect
- Quick View overlay button
- Product name, category, price
- Add to bag button
- Favorite/heart button

### 6.4 ProductDetailPage.tsx
**Role:** Full product detail view (Nike-style).

**Features:**
- Image gallery with thumbnails
- Size selection grid
- Quantity selector
- Add to Bag button
- Favorite button
- Buy in Bulk modal
- Product details, features, care instructions
- Customer reviews section with write review form
- Shipping & returns info

**Data Fetching:**
```typescript
const loadProduct = async () => {
  const data = await fetchFullProduct(productId);
  // Returns product + images + sizes + details + bulk_pricing + colors
};

const loadReviews = async () => {
  const reviewsData = await fetchProductReviews(productId);
};
```

### 6.5 CartSidebar.tsx
**Role:** Slide-out cart drawer.

**Features:**
- Lists all cart items with images
- Shows selected size for each item
- Quantity +/- controls
- Remove item button
- Subtotal calculation
- Checkout button

### 6.6 AuthModal.tsx
**Role:** Login/Signup modal.

**Modes:** Toggle between Sign In and Sign Up

**Fields:**
- Email
- Password
- Full Name (signup only)

**Auth Functions:**
```typescript
// Sign Up
const { error } = await signUp(email, password, fullName);

// Sign In
const { error } = await signIn(email, password);
```

### 6.7 AdminPanel.tsx
**Role:** Inventory management for admin users.

**Tabs:**
1. **Basic Info** - Name, price, stock, category, main image
2. **Images** - Add multiple product images
3. **Sizes & Stock** - Configure sizes with individual stock
4. **Description** - Short/long description, materials, care, features
5. **Bulk Pricing** - Volume discount tiers

**Access Control:**
```typescript
const isAdmin = currentUser?.email === 'tzkusman786@gmail.com';
// All modify operations disabled if !isAdmin
```

### 6.8 AIAssistant.tsx
**Role:** Floating AI fashion chatbot.

**Features:**
- Floating chat bubble (bottom-right)
- Expandable chat window
- Message history
- Typing indicator
- Pre-built suggestion prompts
- Gemini AI responses

---

## 7. Services Layer

### 7.1 supabase.ts

**Initialization:**
```typescript
const SUPABASE_URL = 'https://aplibkzcysdothjgfqmc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jphwGPd_ZOog9XM5Hka7kA_kk285KuL';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

**Authentication Functions:**
```typescript
signUp(email, password, fullName)    // Create new user
signIn(email, password)              // Log in user
signOut()                            // Log out user
getSession()                         // Get current session
getCurrentUser()                     // Get current user object
onAuthChange(callback)               // Subscribe to auth changes
```

**Product Functions:**
```typescript
fetchProducts()                      // Get all products
fetchProductsByCategory(category)    // Filter by category
fetchProductById(id)                 // Get single product
addProduct(product)                  // Create product
updateProduct(id, updates)           // Update product
deleteProduct(id)                    // Delete product
deleteAllProducts()                  // Purge all products
```

**Product Detail Functions:**
```typescript
fetchProductImages(productId)        // Get additional images
fetchProductSizes(productId)         // Get size options
fetchProductDetails(productId)       // Get extended details
fetchBulkPricing(productId)          // Get volume discounts
fetchProductColors(productId)        // Get color variants
fetchFullProduct(id)                 // Get product with all related data
```

**Admin Functions:**
```typescript
addProductWithDetails(product, details, sizes, images, bulkPricing)
updateProductDetails(productId, details)
addProductSize(productId, size)
deleteProductSize(sizeId)
addProductImage(productId, image)
deleteProductImage(imageId)
addBulkPricing(productId, pricing)
deleteBulkPricing(pricingId)
```

**Wishlist Functions:**
```typescript
addToWishlist(productId)
removeFromWishlist(productId)
isInWishlist(productId)
fetchUserWishlist()
```

**Review Functions:**
```typescript
fetchProductReviews(productId)
addProductReview(productId, rating, title, reviewText)
updateProductReview(reviewId, rating, title, reviewText)
deleteProductReview(reviewId)
getUserReviewForProduct(productId)
markReviewHelpful(reviewId)
```

### 7.2 gemini.ts

**Configuration:**
```typescript
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC1WcMOOHEHnPfCb8stiRZYGurcXEx6kII';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

**System Prompt:**
```typescript
const SYSTEM_PROMPT = `You are Denivo's AI Fashion Consultant...
- Help with styling advice
- Explain collections and products
- Suggest outfit combinations
- Provide care instructions
Keep responses concise (2-3 paragraphs max).`;
```

**Chat Function:**
```typescript
export const sendMessage = async (message: string): Promise<string> => {
  const chat = model.startChat({
    history: [{ role: 'user', parts: [{ text: SYSTEM_PROMPT }] }],
  });
  const result = await chat.sendMessage(message);
  return result.response.text();
};
```

---

## 8. Authentication Flow

### Sign Up Flow:
```
1. User clicks "Sign Up" in AuthModal
2. Enters email, password, full name
3. signUp() called → Supabase creates user
4. Email confirmation sent (if enabled in Supabase)
5. User clicks confirmation link
6. Redirected back to app, session created
7. onAuthChange fires → updates user state
```

### Sign In Flow:
```
1. User clicks "Sign In" in AuthModal
2. Enters email, password
3. signIn() called → Supabase validates credentials
4. Session created, stored in localStorage
5. onAuthChange fires → updates user state
6. Modal closes, UI updates to show user
```

### Session Persistence:
```typescript
// On app load
useEffect(() => {
  const initAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };
  initAuth();

  // Listen for changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => setUser(session?.user ?? null)
  );
  return () => subscription.unsubscribe();
}, []);
```

### Admin Check:
```typescript
const isAdmin = user?.email === 'tzkusman786@gmail.com';
```

---

## 9. Admin Panel Features

### Product Creation Workflow:
```
1. Go to Admin Panel (visible only to admin)
2. Fill Basic Info tab:
   - Product name
   - Price
   - Stock quantity
   - Category (Men/Women/Accessories)
   - Main image URL
   - Quick description
3. Click "Publish Item" → Product created
4. Product now appears in catalog
5. Click "Edit" on product to access more tabs
```

### Adding Images (Edit Mode):
```
1. Click Edit on a product
2. Go to "Images" tab
3. Paste image URL
4. Click + button
5. Repeat for multiple angles
```

### Configuring Sizes (Edit Mode):
```
1. Click Edit on a product
2. Go to "Sizes & Stock" tab
3. Enter:
   - Label: "S (4-6)"
   - Value: "S"
   - Stock: 15
4. Click + to add
5. Repeat for all sizes (XS, S, M, L, XL, XXL)
```

### Adding Bulk Pricing (Edit Mode):
```
1. Click Edit on a product
2. Go to "Bulk Pricing" tab
3. Enter tier:
   - Min Qty: 10
   - Max Qty: 24 (optional)
   - Discount: 10%
4. Click + to add
5. Add more tiers (25-49 = 12%, 50+ = 15%)
```

### Extended Descriptions (Edit Mode):
```
1. Go to "Description" tab
2. Fill in:
   - Short Description (shown under title)
   - Full Description (Product Details section)
   - Materials
   - SKU
   - Care Instructions
   - Features (one per line)
3. Save by clicking "Update Product" in Basic Info tab
```

---

## 10. Product Detail System

### Data Structure (FullProduct):
```typescript
interface FullProduct extends Product {
  images: ProductImage[];      // Additional images
  sizes: ProductSize[];        // Size options with stock
  details: ProductDetails | null;  // Extended info
  bulk_pricing: BulkPricing[]; // Volume discounts
  colors: ProductColor[];      // Color variants
}
```

### Image Gallery:
- Main image from `product.image_url`
- Additional images from `product.images[]`
- Thumbnails on left side
- Click to switch main image
- Arrow navigation

### Size Selection:
- If `product.sizes.length > 0`: Show database sizes
- Else: Show default sizes (XS, S, M, L, XL, XXL)
- Disabled state for out-of-stock sizes
- Size guide modal with measurements

### Bulk Order Modal:
- Triggered by "Buy in Bulk" button
- Shows pricing tiers from `product.bulk_pricing`
- Quantity selector
- Live discount calculation
- Total price with savings shown

### Reviews Section:
- Displays all reviews from `product_reviews` table
- Write review form (logged-in users only)
- Star rating selection (1-5)
- Title and review text
- Helpful button
- User's own review highlighted

---

## 11. AI Fashion Assistant

### Integration:
```typescript
// AIAssistant.tsx
import { sendMessage, isGeminiAvailable } from '../services/gemini';

const handleSend = async () => {
  const response = await sendMessage(inputValue);
  setMessages(prev => [...prev, { role: 'assistant', content: response }]);
};
```

### UI Features:
- Floating button (bottom-right corner)
- Expandable chat window
- Message bubbles (user = right, AI = left)
- Typing indicator while waiting
- Suggestion chips for quick prompts:
  - "What's trending this season?"
  - "How should I style a blazer?"
  - "Recommend gifts under $200"

### Fallback:
If Gemini API fails, shows helpful fallback message with manual suggestions.

---

## 12. Deployment Guide

### Local Development:
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### GitHub Setup:
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/tzkusman/denivo-premium-clothing.git

# Push
git push -u origin main
```

### Vercel Deployment:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod

# With environment variables
# Set in Vercel Dashboard: Settings → Environment Variables
# VITE_GEMINI_API_KEY = your_api_key
```

### Automatic Deployments:
Once connected to GitHub, every push to `main` auto-deploys to Vercel.

---

## 13. SQL Queries Reference

### Complete Database Setup (Run Once):
```sql
-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Sizes
CREATE TABLE IF NOT EXISTS product_sizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_label TEXT NOT NULL,
    size_value TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Details
CREATE TABLE IF NOT EXISTS product_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    short_description TEXT,
    long_description TEXT,
    materials TEXT,
    care_instructions TEXT,
    features TEXT[],
    sku TEXT,
    brand TEXT DEFAULT 'Denivo',
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_highly_rated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bulk Pricing
CREATE TABLE IF NOT EXISTS bulk_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    discount_percent DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 7. Product Colors
CREATE TABLE IF NOT EXISTS product_colors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_hex TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Product Reviews
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin full control products" ON products FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);

-- Product Images
CREATE POLICY "Anyone can view images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admin manage images" ON product_images FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);

-- Product Sizes
CREATE POLICY "Anyone can view sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Admin manage sizes" ON product_sizes FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);

-- Product Details
CREATE POLICY "Anyone can view details" ON product_details FOR SELECT USING (true);
CREATE POLICY "Admin manage details" ON product_details FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);

-- Bulk Pricing
CREATE POLICY "Anyone can view bulk pricing" ON bulk_pricing FOR SELECT USING (true);
CREATE POLICY "Admin manage bulk pricing" ON bulk_pricing FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);

-- Wishlist
CREATE POLICY "Users manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- Product Colors
CREATE POLICY "Anyone can view colors" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Admin manage colors" ON product_colors FOR ALL USING (
    auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);

-- Product Reviews
CREATE POLICY "Anyone can view reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON product_reviews FOR DELETE USING (
    auth.uid() = user_id OR auth.jwt() ->> 'email' = 'tzkusman786@gmail.com'
);

-- Helper function for helpful count
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 14. Troubleshooting

### Issue: "Action Blocked" when adding/editing products
**Cause:** RLS policies not set or user not logged in as admin
**Fix:** 
1. Ensure logged in as `tzkusman786@gmail.com`
2. Run the RLS policies SQL in Supabase

### Issue: Email confirmation not received
**Cause:** Supabase's built-in email service has limits
**Fix Options:**
1. Disable email confirmation: Supabase Dashboard → Auth → Settings → Disable "Confirm email"
2. Configure custom SMTP in Supabase settings

### Issue: Gemini API not working
**Cause:** API key not set in environment
**Fix:**
1. Check Vercel environment variable is set
2. Ensure `VITE_GEMINI_API_KEY` (not `API_KEY`)
3. Redeploy after adding env var

### Issue: Products not loading
**Cause:** Supabase connection issue or empty table
**Fix:**
1. Check Supabase URL and key in supabase.ts
2. Verify `products` table exists
3. Check browser console for errors

### Issue: Cart not persisting
**Cause:** Cart is stored in React state only
**Fix:** Currently by design. For persistence, could add localStorage or database cart table.

### Issue: Images not displaying
**Cause:** Invalid image URLs or CORS issues
**Fix:** 
1. Use Unsplash URLs (they allow hotlinking)
2. Or upload to Supabase Storage

---

## 15. Future Enhancements

### Potential Features to Add:
1. **Checkout & Payments** - Stripe integration
2. **Order History** - Orders table, order tracking
3. **Search** - Full-text search across products
4. **Filters** - Price range, size, color filters
5. **Related Products** - "You may also like" section
6. **Image Upload** - Supabase Storage for admin uploads
7. **Email Notifications** - Order confirmations, shipping updates
8. **Inventory Alerts** - Low stock notifications
9. **Analytics Dashboard** - Sales, views, conversion tracking
10. **Multi-language** - i18n support
11. **PWA** - Offline support, installable app
12. **Size Recommendations** - AI-based size suggestions

### Database Additions for Future:
```sql
-- Orders Table (future)
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    status TEXT,
    total DECIMAL(10,2),
    shipping_address JSONB,
    created_at TIMESTAMPTZ
);

-- Order Items Table (future)
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER,
    size TEXT,
    price DECIMAL(10,2)
);
```

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Git
git add .
git commit -m "message"
git push

# Deployment
vercel --prod            # Deploy to production

# Check build errors
npm run build 2>&1
```

---

## Contact & Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/aplibkzcysdothjgfqmc
- **Vercel Dashboard:** https://vercel.com/tzkusmans-projects/denivo-premium-clothing
- **GitHub Repo:** https://github.com/tzkusman/denivo-premium-clothing
- **Live Site:** https://denivo-premium-clothing.vercel.app

---

*This documentation was auto-generated to preserve the complete project state. Update as new features are added.*
