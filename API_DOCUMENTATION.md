# Tajwin Enterprise Backend API Documentation

## Common Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... } // Optional pagination object
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ], // Optional array of field-level validation errors
  "statusCode": 400
}
```

---

## 1. Authentication Module
**Base URL:** `/api/v1/auth`

### 1.1 Login
- **Endpoint:** `POST /login`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "admin@tajwin.com",
  "password": "AdminPassword123!"
}
```
- **Response:** Access Token and Refresh Token, User Profile details. (Tokens set in cookies as well).

### 1.2 Refresh Token
- **Endpoint:** `POST /refresh`
- **Auth Required:** Yes (Refresh token in cookie or body)
- **Response:** New Access Token.

### 1.3 Get Profile
- **Endpoint:** `GET /profile`
- **Auth Required:** Yes (Any role)
- **Response:** User profile details.

### 1.4 Update Profile
- **Endpoint:** `PUT /profile`
- **Auth Required:** Yes (Any role)
- **Request Body:**
```json
{
  "name": "Admin User",
  "mobile": "9876543210"
}
```

### 1.5 Change Password
- **Endpoint:** `POST /change-password`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123!"
}
```

### 1.6 Logout
- **Endpoint:** `POST /logout`
- **Auth Required:** Yes

---

## 2. Admin Module (Dealership Onboarding & Management)
**Base URL:** `/api/v1/admin/dealerships`  
**Auth Required:** Yes (`ADMIN` role)  

### 2.1 Create Dealership (Invite)
- **Endpoint:** `POST /`
- **Request Body:**
```json
{
  "businessName": "Apex Dealership",
  "email": "apex@dealership.com",
  "phone": "9876543210",
  "password": "DealerPassword123!"
}
```

### 2.2 Get Dealership List
- **Endpoint:** `GET /`
- **Query Params:** `?page=1&limit=10&status=approved`

### 2.3 Search Dealerships
- **Endpoint:** `GET /search`
- **Query Params:** `?query=Apex`

### 2.4 Get Dealership Details
- **Endpoint:** `GET /:id`

### 2.5 Update Dealership Status
- **Endpoint:** `PATCH /:id/status`
- **Request Body:** `{ "status": "approved", "remarks": "Verified documents" }`

---

## 3. Product Management Module
**Base URL:** `/api/v1/admin/products`  
**Auth Required:** Yes (`ADMIN` role)  

### 3.1 Create Product
- **Endpoint:** `POST /`
- **Request Body:**
```json
{
  "title": "Dell Latitude 5420 Refurbished",
  "brand": "Dell",
  "category": "Laptops",
  "sku": "DELL-LAT-5420",
  "basePrice": 35000,
  "sellingPrice": 38000,
  "description": "Intel i5 11th Gen, 16GB RAM, 512GB SSD"
}
```

### 3.2 Get All Products
- **Endpoint:** `GET /`
- **Query Params:** `?page=1&limit=10&brand=Dell`

### 3.3 Get Product By ID
- **Endpoint:** `GET /:productId`

### 3.4 Update Product
- **Endpoint:** `PUT /:productId`

### 3.5 Delete Product
- **Endpoint:** `DELETE /:productId`

---

## 4. Inventory Management Module (Phase 1)
**Base URL:** `/api/v1/admin/inventory` (or `/api/admin/inventory`)  
**Auth Required:** Yes (`ADMIN` role)  

### 4.1 Dashboard (`/dashboard`)
* `GET /dashboard/summary` - Total stock, valuation, low stock count, out of stock count, active allocations.
* `GET /dashboard/statistics` - Breakdown by category, brand, and stock status.
* `GET /dashboard/warehouse-stats` - Warehouse distribution metrics.
* `GET /dashboard/dealer-stats` - Dealer allocated stock metrics.
* `GET /dashboard/retailer-stats` - Retailer stock metrics.
* `GET /dashboard/enduser-stats` - End user delivery metrics.
* `GET /dashboard/recent-activities` - Recent 10 inventory audit logs.
* `GET /dashboard/monthly-summary?year=2026` - Monthly inflow & outflow summary.
* `GET /dashboard/graph-data?days=30` - Stock trend chart datapoints.
* `GET /dashboard/stock-trends` - Stock trend metrics.
* `GET /dashboard/low-stock-count` - Low stock count.
* `GET /dashboard/out-of-stock-count` - Out of stock count.

### 4.2 Inventory Management (`/`)
* `POST /` - Add single inventory item.
  ```json
  {
    "productName": "Galaxy S24 Ultra",
    "brand": "Samsung",
    "model": "SM-S928B",
    "category": "Smartphones",
    "sku": "SAM-S24U-512GB",
    "barcode": "8806095000000",
    "serialNumber": "SN-SAM-998822",
    "purchasePrice": 950.00,
    "sellingPrice": 1299.99,
    "quantity": 50,
    "availableQuantity": 50,
    "minimumStockLevel": 10,
    "maximumStockLevel": 500,
    "remarks": "New Flagship Item"
  }
  ```
* `GET /` - Fetch paginated inventory list (`?page=1&limit=10&brand=Samsung&status=In Stock`).
* `GET /:inventoryId` - Get inventory item details by ID.
* `GET /sku/:sku` - Lookup item by SKU.
* `GET /serial/:serialNumber` - Lookup item by Serial Number.
* `PUT /:inventoryId` - Update inventory details.
* `DELETE /:inventoryId` - Delete inventory item (Hard Delete).
* `PATCH /:inventoryId/soft-delete` - Soft delete item.
* `PATCH /:inventoryId/restore` - Restore soft deleted item.
* `PATCH /:inventoryId/increase-stock` - Increase stock (`{ "amount": 10 }`).
* `PATCH /:inventoryId/decrease-stock` - Decrease stock (`{ "amount": 5 }`).
* `PATCH /:inventoryId/update-stock` - Direct stock update (`{ "quantity": 70, "availableQuantity": 70 }`).
* `POST /bulk-upload` - Bulk upload items.
* `POST /bulk-delete` - Bulk delete items.
* `PATCH /bulk-update` - Bulk update items.
* `POST /check-duplicate` - Check SKU/Serial uniqueness.
* `POST /validate` - Validate inventory payload.
* `POST /import` - Import inventory payload.
* `GET /export?format=excel` - Export inventory data.
* `GET /:inventoryId/history` - Item movement history.
* `GET /:inventoryId/timeline` - Item activity timeline.
* `GET /:inventoryId/audit` - Item audit report.
* `POST /:inventoryId/clone` - Clone inventory item.
* `PATCH /:inventoryId/archive` - Archive inventory item.

### 4.3 Warehouse Management (`/warehouses`)
* `GET /warehouses/summary` - Warehouse capacity and overview summary.
* `GET /warehouses/search?q=Central` - Search warehouses by name/code.
* `GET /warehouses/filter?status=Active` - Filter warehouses.
* `POST /warehouses/transfer` - Inter-warehouse stock transfer.
* `POST /warehouses/reserve` - Reserve stock.
* `POST /warehouses/adjust` - Adjust warehouse stock.
* `POST /warehouses/damage` - Record damaged stock.
* `POST /warehouses/returns` - Process warehouse returns.
* `GET /warehouses/:warehouseId/stock` - Warehouse stock count.
* `GET /warehouses/:warehouseId/items` - Inventory items in warehouse.
* `GET /warehouses/:warehouseId/history` - Warehouse movement history.
* `GET /warehouses/:warehouseId/capacity` - Warehouse capacity metrics.
* `GET /warehouses/:warehouseId/activity-log` - Warehouse activity log.
* `GET /warehouses/:warehouseId` - Warehouse details.

### 4.4 Stock Allocation (`/allocations`)
* `POST /allocations` - Allocate stock to Dealer/Retailer/EndUser.
* `POST /allocations/bulk` - Execute bulk stock allocation.
* `GET /allocations/history` - Stock allocation history.
* `GET /allocations/logs` - Allocation logs.
* `GET /allocations/reports` - Allocation aggregate reports.
* `PATCH /allocations/:id/reallocate` - Reallocate stock.
* `PATCH /allocations/:id/cancel` - Cancel allocation.
* `PATCH /allocations/:id/approve` - Approve allocation.
* `PATCH /allocations/:id/reject` - Reject allocation.
* `PATCH /allocations/:id/status` - Update allocation status.
* `GET /allocations/:id/timeline` - Allocation audit timeline.
* `GET /allocations/:id` - Allocation details.

### 4.5 Dealer Inventory (`/dealers`)
* `GET /dealers/summary` - Dealer stock summary.
* `GET /dealers/search?q=Galaxy` - Search dealer inventory.
* `GET /dealers/filter` - Filter dealer inventory.
* `GET /dealers/reports` - Dealer inventory reports.
* `POST /dealers/returns` - Process dealer returns.
* `POST /dealers/damaged` - Record dealer damaged stock.
* `GET /dealers/:dealerId/stock` - Specific dealer stock details.
* `GET /dealers/:dealerId/history` - Dealer inventory history.
* `GET /dealers/:dealerId/movements` - Dealer stock movements.
* `GET /dealers/:dealerId/stock-count` - Physical stock count for dealer.
* `GET /dealers/:dealerId/available` - Dealer available stock.
* `GET /dealers/:dealerId/allocations` - Allocations assigned to dealer.

### 4.6 Retailer Inventory (`/retailers`)
* `GET /retailers/summary` - Retailer stock summary.
* `GET /retailers/search` - Search retailer inventory.
* `GET /retailers/filter` - Filter retailer inventory.
* `GET /retailers/reports` - Retailer reports.
* `POST /retailers/returns` - Process retailer returns.
* `POST /retailers/damaged` - Record retailer damaged stock.
* `GET /retailers/:retailerId/stock` - Retailer stock details.
* `GET /retailers/:retailerId/history` - Retailer inventory history.
* `GET /retailers/:retailerId/movements` - Retailer stock movements.
* `GET /retailers/:retailerId/stock-count` - Retailer physical stock count.
* `GET /retailers/:retailerId/available` - Retailer available stock.

### 4.7 End User Tracking (`/end-user`)
* `GET /end-user/delivered` - Delivered products list.
* `GET /end-user/pending` - Pending deliveries list.
* `GET /end-user/deliveries/history` - Delivery history log.
* `GET /end-user/returns` - Returned customer products.
* `GET /end-user/replacements` - Replacement products list.
* `GET /end-user/deliveries/:deliveryId` - Delivery details.
* `PATCH /end-user/deliveries/:deliveryId/status` - Update delivery status.
* `GET /end-user/customer/:customerId/purchases` - Customer purchase history.
* `GET /end-user/customer/:customerId` - Inventory held by customer.
* `GET /end-user/warranty/:serialNumber` - Track warranty status by serial number.
* `GET /end-user/products/:serialNumber/timeline` - Lifecycle timeline for end-user item.

### 4.8 Inventory Movement (`/movements`)
* `GET /movements/history` - Complete movement log history.
* `GET /movements/timeline` - Movement timeline stream.
* `GET /movements/date-range` - Filter movements by date range.
* `GET /movements/search` - Search movement records.
* `GET /movements/filter` - Multi-field movement filter.
* `GET /movements/reports` - Stock movement aggregate report.
* `GET /movements/export` - Export movement logs.
* `GET /movements/audit` - Validate movement integrity audit.
* `GET /movements/product/:productId` - Product movement trail.
* `GET /movements/warehouse/:warehouseId` - Warehouse movement trail.
* `GET /movements/dealer/:dealerId` - Dealer movement trail.
* `GET /movements/retailer/:retailerId` - Retailer movement trail.
* `GET /movements/:movementId` - Movement details by ID.

### 4.9 Low Stock Management (`/low-stock`, `/out-of-stock`, `/critical-stock`, `/stock-alerts`)
* `GET /low-stock` - Low stock items list.
* `GET /out-of-stock` - Out of stock items list.
* `GET /critical-stock` - Critical stock alert list.
* `GET /stock-alerts` - Active low stock alerts.
* `GET /low-stock/history` - Low stock log history.
* `GET /low-stock/notifications` - Triggered low stock notifications.
* `POST /low-stock/generate-alerts` - Trigger auto alert generation.
* `PATCH /:inventoryId/threshold` - Update stock threshold levels.

### 4.10 Search & Filters (`/search`, `/filter`)
* `GET /search?q=Samsung&brand=Samsung&status=In Stock` - Enterprise global multi-field search.
* `GET /filter?brand=Samsung&category=Smartphones` - Dynamic multi-param filter matrix.

### 4.11 Dynamic Reports (`/reports/:reportType`)
* `GET /reports/summary` - Inventory Summary Report.
* `GET /reports/warehouse` - Warehouse Stock Distribution Report.
* `GET /reports/dealer` - Dealer Inventory Report.
* `GET /reports/retailer` - Retailer Inventory Report.
* `GET /reports/end-user` - End User Distribution Report.
* `GET /reports/movement` - Movement Log Report.
* `GET /reports/allocation` - Stock Allocation Report.
* `GET /reports/damage` - Damaged Goods Analysis Report.
* `GET /reports/returns` - Returned Items Audit Report.
* `GET /reports/low-stock` - Low Stock Breach Report.
* `GET /reports/out-of-stock` - Out Of Stock Summary Report.
* `GET /reports/monthly?year=2026` - Monthly Historical Report.
* `GET /reports/yearly?year=2026` - Annual Performance Report.

### 4.12 Activity Logs (`/logs`)
* `GET /logs/activity` - Comprehensive system activity logs.
* `GET /logs/audit` - Immutable stock audit trail.
* `GET /logs/system` - System level trigger logs.
* `GET /logs/timeline` - Visual activity timeline stream.
* `GET /logs/filter?module=Inventory` - Filter activity logs.
* `GET /logs/search?q=CREATE` - Free text activity log search.
* `GET /logs/user/:userId` - User activity log.
* `GET /logs/inventory/:inventoryId` - Item-specific activity trail.
* `GET /logs/warehouse/:warehouseId` - Warehouse activity logs.
* `GET /logs/dealer/:dealerId` - Dealer activity logs.
* `GET /logs/retailer/:retailerId` - Retailer activity logs.

### 4.13 System Notifications (`/notifications`)
* `GET /notifications/unread` - Unread notifications list.
* `GET /notifications` - Notifications list.
* `PATCH /notifications/:id/read` - Mark notification as read.
* `DELETE /notifications/:id` - Delete notification.

---

## 5. Order Management Module (Phase 1)
**Base URL:** `/api/v1/admin/orders` (or `/api/admin/orders`)  
**Auth Required:** Yes (`ADMIN` role)  

### 5.1 Order Dashboard
- **Endpoint:** `GET /dashboard`
- **Response:** Total orders, today's orders, status breakdown (pending, confirmed, processing, packed, shipped, delivered, cancelled), total revenue, recent orders.

### 5.2 Create Order
- **Endpoint:** `POST /`
- **Request Body:**
```json
{
  "orderId": "ORD-20260724-1001",
  "customerInfo": {
    "name": "Rohan Sharma",
    "mobile": "9876543210",
    "email": "rohan.sharma@example.com"
  },
  "shippingAddress": {
    "address": "Flat 402, Green Park Apartments, MG Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "items": [
    {
      "productName": "Dell Latitude 5420 Refurbished",
      "sku": "DELL-LAT-5420-001",
      "quantity": 1,
      "price": 35000
    }
  ],
  "paymentInfo": {
    "method": "UPI",
    "status": "Paid",
    "transactionId": "TXN-987654321"
  },
  "tax": 1800,
  "shippingCharge": 250,
  "discount": 500
}
```

### 5.3 Get All Orders (Listing)
- **Endpoint:** `GET /`
- **Query Params:** `?page=1&limit=10&search=Rohan&orderStatus=Pending&paymentStatus=Paid`

### 5.4 Get Order Details
- **Endpoint:** `GET /:orderId`

### 5.5 Update Order Details
- **Endpoint:** `PUT /:orderId`

### 5.6 Delete Order
- **Endpoint:** `DELETE /:orderId`

### 5.7 Update Order Status
- **Endpoint:** `PATCH /:orderId/status`
- **Request Body:** `{ "status": "Confirmed", "remarks": "Order verified by admin" }`

### 5.8 Get Payment Details
- **Endpoint:** `GET /:orderId/payment`

### 5.9 Update Payment Status
- **Endpoint:** `PATCH /:orderId/payment`

### 5.10 Get Shipping Details
- **Endpoint:** `GET /:orderId/shipping`

### 5.11 Update Shipping Details
- **Endpoint:** `PATCH /:orderId/shipping`

### 5.12 Generate Invoice
- **Endpoint:** `GET /:orderId/invoice`

### 5.13 Get Order Timeline
- **Endpoint:** `GET /:orderId/timeline`

---

## 6. Dealership Module (Retailer Onboarding)
**Base URL:** `/api/v1/dealerships`  
**Auth Required:** Yes (`DEALERSHIP` role + `APPROVED` status)  

### 6.1 Dealership Profile Update
- **Endpoint:** `PUT /profile`

### 6.2 Create Retailer
- **Endpoint:** `POST /retailers`

### 6.3 Get Retailer List
- **Endpoint:** `GET /retailers`

### 6.4 Verify Retailer
- **Endpoint:** `PATCH /retailers/:id/verify`

### 6.5 Update Retailer Status
- **Endpoint:** `PATCH /retailers/:id/status`

### 6.6 Dealership Dashboard
- **Endpoint:** `GET /dashboard/overview`

---

## 7. Retailer Module (Customer Onboarding)
**Base URL:** `/api/v1/retailers`  
**Auth Required:** Yes (`RETAILER` role + `VERIFIED` status)  

### 7.1 Register Customer (In-Store Onboarding)
- **Endpoint:** `POST /customers`

### 7.2 Get Customer List
- **Endpoint:** `GET /customers`

### 7.3 Search Customers
- **Endpoint:** `GET /customers/search`

### 7.4 Retailer Dashboard
- **Endpoint:** `GET /dashboard/summary`
