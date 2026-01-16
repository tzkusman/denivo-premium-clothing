# DENIVO Premium Clothing - Complete Project Documentation

> **Last Updated:** January 16, 2026  
> **Developer:** Usman Shaik (tzkusman786@gmail.com)  
> **Live Site:** https://denivo-premium-clothing.vercel.app  
> **GitHub:** https://github.com/tzkusman/denivo-premium-clothing

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Supabase Configuration](#supabase-configuration)
5. [Database Tables & SQL](#database-tables--sql)
6. [EmailJS Integration](#emailjs-integration)
7. [Features Implemented](#features-implemented)
8. [Setup Guide](#setup-guide)
9. [Environment Variables](#environment-variables)
10. [Deployment](#deployment)
11. [Admin Access](#admin-access)
12. [API Reference](#api-reference)

---

## 🎯 Project Overview

DENIVO is a premium e-commerce clothing store built with React, TypeScript, and Supabase. It features:

- Modern, responsive UI with Tailwind CSS
- Product catalog with categories (Men, Women, Accessories)
- Shopping cart with guest checkout
- Multi-step checkout process
- Cash on Delivery (COD) and Online Payment options
- Admin panel for product and order management
- AI-powered style assistant (Gemini)
- Automatic email notifications via EmailJS
- Invoice generation with print/download
- Pakistan-focused (PKR currency, Pakistan provinces/cities)

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.3 | Frontend framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 6.2.0 | Build tool |
| Tailwind CSS | CDN | Styling |
| Supabase | Latest | Database, Auth, Storage |
| EmailJS | @emailjs/browser | Email notifications |
| Lucide React | Latest | Icons |
| Google Gemini | API | AI Assistant |

---

## 📁 Project Structure

```
denivo---premium-clothing/
├── index.html                 # Main HTML entry
├── index.tsx                  # React entry point
├── App.tsx                    # Main App component
├── types.ts                   # TypeScript types & constants
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── PROJECT_DOCUMENTATION.md   # This file
│
├── components/
│   ├── AdminPanel.tsx         # Admin dashboard (Products & Orders)
│   ├── AIAssistant.tsx        # Gemini AI chat assistant
│   ├── AuthModal.tsx          # Login/Signup modal
│   ├── CartSidebar.tsx        # Shopping cart drawer
│   ├── CheckoutPage.tsx       # 3-step checkout with invoice
│   ├── Navbar.tsx             # Navigation header
│   ├── ProductCard.tsx        # Product display card
│   ├── ProductDetailPage.tsx  # Full product page
│   └── SupabaseSetup.tsx      # Setup guide component
│
├── services/
│   ├── supabase.ts            # Supabase client & all API functions
│   └── gemini.ts              # Gemini AI integration
│
└── supabase/
    └── functions/
        └── send-order-email/  # Edge Function (optional)
            └── index.ts
```

---

## 🗄 Supabase Configuration

### Project Details

| Setting | Value |
|---------|-------|
| Project URL | `https://aplibkzcysdothjgfqmc.supabase.co` |
| Project Ref | `aplibkzcysdothjgfqmc` |
| Region | (Your region) |
| Anon Key | `sb_publishable_jphwGPd_ZOog9XM5Hka7kA_kk285KuL` |

### Authentication Settings

- Email/Password authentication enabled
- No email confirmation required (for easier testing)
- Admin email: `tzkusman786@gmail.com`

---

## 📊 Database Tables & SQL

### Complete SQL to Setup All Tables

Run this in **Supabase SQL Editor**:

```sql
-- =============================================
-- DENIVO E-COMMERCE DATABASE SCHEMA
-- =============================================

-- 1. PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    stock INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can insert products" ON products FOR INSERT TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');
CREATE POLICY "Admin can update products" ON products FOR UPDATE TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');
CREATE POLICY "Admin can delete products" ON products FOR DELETE TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');

-- 2. PRODUCT IMAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admin can manage product_images" ON product_images FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');

-- 3. PRODUCT SIZES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_sizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read product_sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Admin can manage product_sizes" ON product_sizes FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');

-- 4. PRODUCT DETAILS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material TEXT,
    care_instructions TEXT,
    features TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read product_details" ON product_details FOR SELECT USING (true);
CREATE POLICY "Admin can manage product_details" ON product_details FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');

-- 5. BULK PRICING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bulk_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    price_per_unit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bulk_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bulk_pricing" ON bulk_pricing FOR SELECT USING (true);
CREATE POLICY "Admin can manage bulk_pricing" ON bulk_pricing FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');

-- 6. PRODUCT REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add reviews" ON product_reviews FOR INSERT TO authenticated 
    WITH CHECK (true);
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON product_reviews FOR DELETE TO authenticated 
    USING (auth.uid() = user_id);

-- 7. ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'online')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT,
    shipping_zip TEXT NOT NULL,
    shipping_country TEXT DEFAULT 'Pakistan',
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    order_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_insert_policy" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_select_policy" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update_policy" ON orders FOR UPDATE TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');
CREATE POLICY "orders_delete_policy" ON orders FOR DELETE TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');

-- 8. ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    size TEXT,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_insert_policy" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_select_policy" ON order_items FOR SELECT USING (true);
CREATE POLICY "order_items_update_policy" ON order_items FOR UPDATE TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');
CREATE POLICY "order_items_delete_policy" ON order_items FOR DELETE TO authenticated 
    USING (auth.jwt() ->> 'email' = 'tzkusman786@gmail.com');

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
```

---

## 📧 EmailJS Integration

### Configuration

| Setting | Value |
|---------|-------|
| Service ID | `service_25hkwer` |
| Template ID | `template_xayr1pr` |
| Public Key | `3vMFDpsTIZNCA4H8m` |

### Template Variables

The code sends these variables to EmailJS:

```javascript
{
  to_email: "customer@email.com",      // Customer email
  email: "customer@email.com",         // Backup email field
  order_id: "DNV-20260116-1234",       // Order number
  customer_name: "John Doe",           // Customer name
  orders: [                            // Array of items
    { name: "Product Name (Size)", price: "Rs. 1,000", units: 2 }
  ],
  cost: {
    shipping: "Rs. 500",
    tax: "Rs. 0"
  },
  total: "Rs. 1,500",
  shipping_address: "123 Street",
  shipping_city: "Karachi",
  shipping_state: "Sindh",
  shipping_zip: "75700",
  payment_method: "Cash on Delivery"
}
```

### Email Triggers

1. **Order Placed** → Automatic confirmation email to customer
2. **Admin Confirms** → Status update email
3. **Admin Ships** → Shipping notification email
4. **Admin Delivers** → Delivery confirmation email

---

## ✨ Features Implemented

### Customer Features

- [x] Product browsing with categories
- [x] Product detail pages with images, sizes, reviews
- [x] Shopping cart (persists in state)
- [x] Guest checkout (no login required)
- [x] 3-step checkout: Shipping → Payment → Confirm
- [x] Cash on Delivery (COD) option
- [x] Online Payment option
- [x] Pakistan provinces and cities dropdown
- [x] PKR currency (Rs. format)
- [x] Free shipping over Rs. 50,000
- [x] Invoice generation with print/download
- [x] Order confirmation email
- [x] AI Style Assistant (Gemini)

### Admin Features

- [x] Products management (CRUD)
- [x] Product images management
- [x] Product sizes management
- [x] Product details (material, care, features)
- [x] Bulk pricing tiers
- [x] Orders management panel
- [x] Order status updates (Pending → Confirmed → Shipped → Delivered)
- [x] Payment status updates (Mark as Paid)
- [x] Email notifications on status change
- [x] Order statistics (pending, confirmed, shipped, delivered counts)

### Pakistan Localization

- Currency: PKR (Pakistani Rupee) with Rs. prefix
- Provinces: Punjab, Sindh, KPK, Balochistan, Islamabad, AJK, Gilgit-Baltistan
- Cities: Auto-populated based on province selection
- Default country: Pakistan (fixed)
- Shipping: Rs. 500 flat rate, free over Rs. 50,000

---

## 🚀 Setup Guide

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- EmailJS account
- (Optional) Google AI API key for Gemini

### Step 1: Clone Repository

```bash
git clone https://github.com/tzkusman/denivo-premium-clothing.git
cd denivo-premium-clothing
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup Supabase

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the complete SQL from [Database Tables & SQL](#database-tables--sql)
4. Copy your project URL and anon key

### Step 4: Setup EmailJS

1. Create account at https://emailjs.com
2. Add email service (Gmail recommended)
3. Create email template with variables
4. Copy Service ID, Template ID, Public Key

### Step 5: Update Configuration

Edit `services/supabase.ts`:

```typescript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
```

### Step 6: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### Step 7: Create Admin Account

1. Go to site and click Sign In
2. Create account with your admin email
3. Update RLS policies if using different email

---

## 🔐 Environment Variables

Currently hardcoded in source (for simplicity). For production, use:

```env
VITE_SUPABASE_URL=https://aplibkzcysdothjgfqmc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_EMAILJS_SERVICE_ID=service_25hkwer
VITE_EMAILJS_TEMPLATE_ID=template_xayr1pr
VITE_EMAILJS_PUBLIC_KEY=3vMFDpsTIZNCA4H8m
```

---

## 🌐 Deployment

### Vercel (Current)

```bash
npm run build
npx vercel --prod
```

**Live URL:** https://denivo-premium-clothing.vercel.app

### Manual Build

```bash
npm run build
# Output in dist/ folder
```

---

## 👤 Admin Access

| Field | Value |
|-------|-------|
| Email | `tzkusman786@gmail.com` |
| Access | Full admin panel, orders management |

### Admin Panel Features

1. **Products Tab**
   - Add/Edit/Delete products
   - Manage images, sizes, details
   - Set bulk pricing

2. **Orders Tab**
   - View all orders with filters
   - See customer details, items, payment method
   - Update order status (Confirm, Ship, Deliver, Cancel)
   - Mark COD orders as Paid
   - Automatic email on status change

---

## 📚 API Reference

### Supabase Functions (services/supabase.ts)

#### Authentication
```typescript
signUp(email, password, fullName)
signIn(email, password)
signOut()
getSession()
getCurrentUser()
onAuthChange(callback)
```

#### Products
```typescript
fetchProducts()
fetchProductsByCategory(category)
fetchProductById(id)
addProduct(product)
updateProduct(id, product)
deleteProduct(id)
deleteAllProducts()
```

#### Product Extensions
```typescript
fetchProductImages(productId)
addProductImage(productId, imageUrl, altText)
deleteProductImage(imageId)

fetchProductSizes(productId)
addProductSize(productId, size, stock)
deleteProductSize(sizeId)

fetchProductDetails(productId)
updateProductDetails(productId, details)

fetchBulkPricing(productId)
addBulkPricing(productId, pricing)
deleteBulkPricing(pricingId)
```

#### Reviews
```typescript
fetchProductReviews(productId)
addProductReview(productId, userId, userName, rating, comment)
```

#### Orders
```typescript
createOrder(cart, formData, subtotal, shipping, tax, discount)
fetchAllOrders()
fetchOrderItems(orderId)
updateOrderStatus(orderId, status)
updatePaymentStatus(orderId, status)
```

#### Email
```typescript
sendOrderConfirmationEmail(order, items)
sendOrderStatusEmail(order, newStatus)
```

---

## 🔄 What We Built Today (January 16, 2026)

1. ✅ Fixed RLS policy for orders table
2. ✅ Converted currency from USD to PKR (Rs.)
3. ✅ Added Pakistan provinces and cities
4. ✅ Built invoice generation with print/download
5. ✅ Created admin Orders panel with full details
6. ✅ Added order status management (Confirm, Ship, Deliver, Cancel)
7. ✅ Fixed "User is not defined" error (UserIcon import)
8. ✅ Integrated EmailJS for automatic order emails
9. ✅ Email on checkout completion
10. ✅ Email on admin status updates
11. ✅ Deployed multiple times to Vercel

---

## 🤝 Contact & Support

**Developer:** Usman Shaik  
**Email:** tzkusman786@gmail.com  
**GitHub:** https://github.com/tzkusman

---

## 📝 Notes for Future Sessions

- Supabase project: `aplibkzcysdothjgfqmc`
- Admin email: `tzkusman786@gmail.com`
- EmailJS configured with Gmail
- All prices in PKR
- Pakistan-focused shipping
- Guest checkout enabled
- Edge Function for email exists but using EmailJS instead (simpler)

---

*This documentation was auto-generated on January 16, 2026*
