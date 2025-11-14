# FAZ 3 - Migration Instructions

## Overview
FAZ 3 implements the complete Orders System (Customers + Orders + Purchased Passes). Before testing the admin panel features, you **MUST** execute the database migration.

## What's Been Completed

### ✅ Frontend Components Updated
- **AdminCustomers.tsx** - Full API integration with real-time data
- **AdminOrders.tsx** - Full API integration with order status management

### ✅ API Routes Created
- **GET /api/admin/customers** - Fetch customers with filtering, search, pagination
- **GET /api/admin/orders** - Fetch orders with customer details and stats
- **PATCH /api/admin/orders** - Update order status (complete, cancel, refund)

### ✅ Database Migration Ready
- **006_create_orders_system.sql** - Complete schema for orders system

## Migration Steps

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your TuristPass project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Execute Migration
1. Click **New Query**
2. Open the file: `frontend/supabase/migrations/006_create_orders_system.sql`
3. Copy the **ENTIRE** contents of the file
4. Paste into the Supabase SQL Editor
5. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Migration Success
After running the migration, you should see output like:
```
Success. No rows returned
```

### Step 4: Verify Tables Created
In Supabase Dashboard:
1. Go to **Table Editor**
2. You should now see these NEW tables:
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `purchased_passes`

### Step 5: Verify Sample Data
1. Click on `orders` table
2. You should see **5 sample orders** (ORD-001001 through ORD-001005)
3. Click on `customer_profiles` table
4. You should see **5 sample customers** with `total_spent` column populated

## Testing FAZ 3 Features

After migration, test these features:

### Admin Customers Page
Navigate to: `/admin/customers`

**Test Cases:**
1. ✅ Page loads without errors
2. ✅ Stats cards show:
   - Total Customers: 5
   - Active: 4
   - Inactive: 1
   - Avg. Passes: ~1.6
3. ✅ Customer list shows 5 customers with:
   - Name, email, phone
   - Active/Inactive status badge
   - Number of passes
   - Total spent (formatted as ₺X,XXX.XX)
   - Join date
4. ✅ Search functionality:
   - Enter "John" → should filter to John Doe
   - Press Enter or click Search button
5. ✅ Status filter:
   - Select "Active" → should show 4 customers
   - Select "Inactive" → should show 1 customer (Emma Wilson)
6. ✅ Actions dropdown:
   - Click three dots menu
   - "View Details" → shows "coming soon" toast
   - "Send Email" → shows "coming soon" toast

### Admin Orders Page
Navigate to: `/admin/orders`

**Test Cases:**
1. ✅ Page loads without errors
2. ✅ Stats cards show:
   - Total Orders: 5
   - Completed: 3
   - Pending: 1
   - Total Revenue: ₺900,00 (only completed orders)
3. ✅ Order list shows 5 orders with:
   - Order number (ORD-XXXXXX)
   - Status badge with icon (✅ completed, ⏳ pending, ↩️ refunded)
   - Customer name
   - Pass name
   - Amount (formatted as ₺XXX,XX)
   - Date
4. ✅ Search functionality:
   - Enter "ORD-1001" → should filter to that order
   - Enter "John" → should filter to John Doe's order
5. ✅ Status filter:
   - Select "Completed" → should show 3 orders
   - Select "Pending" → should show 1 order (Sarah Martinez)
   - Select "Refunded" → should show 1 order (David Chen)
6. ✅ **Order Status Update** (CRITICAL NEW FEATURE):
   - Find a **pending** order (Sarah Martinez - ORD-001002)
   - Click three dots menu
   - Click "Mark as Completed"
   - ✅ Success toast appears
   - ✅ Order list refreshes
   - ✅ Order status changes to "completed"
   - ✅ Stats update (Completed: 4, Pending: 0)
7. ✅ Order actions availability:
   - **Pending orders** show: "Mark as Completed", "Cancel Order"
   - **Completed orders** show: "Refund Order"
   - **Cancelled orders** show: (no status change options)
   - All orders show: "View Details" (coming soon)

## What's New in FAZ 3

### Database Schema
```sql
-- Updated customer_profiles
ALTER TABLE customer_profiles
ADD COLUMN total_spent NUMERIC DEFAULT 0;

-- New orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE,  -- ORD-XXXXXX
  customer_id UUID REFERENCES customer_profiles(id),
  status TEXT,  -- pending, completed, cancelled, refunded
  total_amount NUMERIC,
  payment_status TEXT,  -- pending, completed, failed, refunded
  payment_method TEXT,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- New order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  pass_name TEXT,
  pass_type TEXT,
  quantity INT,
  unit_price NUMERIC,
  total_price NUMERIC
);

-- New purchased_passes table
CREATE TABLE purchased_passes (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id),
  order_id UUID REFERENCES orders(id),
  pass_name TEXT,
  activation_code TEXT UNIQUE,  -- QR code data
  expiry_date TIMESTAMPTZ,
  status TEXT,  -- active, expired, cancelled, used
  usage_count INT,
  max_usage INT
);
```

### Helper Functions
- `generate_order_number()` - Generates unique ORD-XXXXXX format
- `get_customer_orders_summary(customer_uuid)` - Customer order stats
- `get_admin_orders_stats()` - Global order statistics

### Triggers
- Auto-update `customer_profiles.total_spent` when order payment completes
- Auto-update `updated_at` timestamps

### Sample Data Included
- 5 customers (John Doe, Sarah Martinez, Mike Roberts, Emma Wilson, David Chen)
- 5 orders with various statuses
- 3 purchased passes (active)

## Troubleshooting

### Error: relation "orders" does not exist
**Problem:** Migration not executed
**Solution:** Execute migration 006 in Supabase SQL Editor

### Error: Failed to fetch customers/orders
**Problem:** RLS policies or auth issues
**Solution:**
1. Check you're logged in as admin
2. Verify `admin_profiles` table has your user ID
3. Check browser console for detailed error

### Stats showing 0 everywhere
**Problem:** Sample data not inserted
**Solution:**
1. Re-run the migration (it's idempotent)
2. Check `customer_profiles` table has data
3. Check `orders` table has data

### Order status update not working
**Problem:** API route or auth issue
**Solution:**
1. Check browser console for errors
2. Verify admin authentication
3. Check order UUID matches (orderId vs id field)

## Next Steps After Testing

Once FAZ 3 is verified working:
1. ✅ Confirm all test cases pass
2. ✅ Report any issues
3. 📝 I'll create comprehensive FAZ_3_COMPLETED.md documentation
4. 🚀 Move to FAZ 4 (Passes Management System)

## Architecture Notes

### Order Lifecycle
1. **Created** → Order created, status = 'pending', payment_status = 'pending'
2. **Payment Completed** → payment_status = 'completed'
3. **Order Completed** → status = 'completed', completed_at set, purchased_passes created
4. **Cancelled** → status = 'cancelled' (before completion)
5. **Refunded** → status = 'refunded', refunded_at set (after completion)

### Customer Total Spent
- Auto-calculated via trigger
- Only counts orders where `payment_status = 'completed'`
- Updates whenever order payment status changes

### Purchased Passes
- Created when order is completed
- Has unique activation_code for QR scanning (future feature)
- Tracks expiry_date and status
- Can be used for access control (future feature)

## Files Modified/Created in FAZ 3

### Modified Files:
- `frontend/components/admin/AdminCustomers.tsx` (full API integration)
- `frontend/components/admin/AdminOrders.tsx` (full API integration + status updates)

### Created Files:
- `frontend/app/api/admin/customers/route.ts` (GET endpoint)
- `frontend/app/api/admin/orders/route.ts` (GET + PATCH endpoints)
- `frontend/supabase/migrations/006_create_orders_system.sql` (complete schema)
- `frontend/FAZ_3_MIGRATION_INSTRUCTIONS.md` (this file)

---

**Ready to test? Execute the migration and start testing!** 🚀
