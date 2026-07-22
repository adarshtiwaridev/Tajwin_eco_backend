# Enterprise Authentication & Onboarding APIs

## Common Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... } // Optional for pagination
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ], // Optional array of validation errors
  "statusCode": 400
}
```

---

## 1. Authentication Module
**Base URL:** `/api/v1/auth`

### 1.1 Login
- **Endpoint:** `POST /login`
- **Auth Required:** No
- **Body:** `{ "email": "admin@tajwin.com", "password": "admin123" }`
- **Response:** Access and Refresh Tokens, User Profile. (Tokens set in cookies as well).

### 1.2 Refresh Token
- **Endpoint:** `POST /refresh`
- **Auth Required:** Yes (Refresh Token in cookie or body)
- **Response:** New Access Token.

### 1.3 Get Profile
- **Endpoint:** `GET /profile`
- **Auth Required:** Yes (Any role)
- **Response:** User details and role-specific profile data.

### 1.4 Update Profile
- **Endpoint:** `PUT /profile`
- **Auth Required:** Yes (Any role)
- **Body:** `{ "name": "New Name", "mobile": "8888888888" }`

### 1.5 Change Password
- **Endpoint:** `POST /change-password`
- **Auth Required:** Yes
- **Body:** `{ "currentPassword": "old", "newPassword": "new" }`

### 1.6 Logout
- **Endpoint:** `POST /logout`
- **Auth Required:** Yes

---

## 2. Admin Module (Dealership Onboarding)
**Base URL:** `/api/v1/admin/dealerships`
**Auth Required:** Yes (`ADMIN` role)

### 2.1 Create Dealership (Invite)
- **Endpoint:** `POST /`
- **Body:** `{ "businessName": "D1", "email": "d1@ex.com", "phone": "1234567890", "password": "pass" }`
- **Response:** Creates Dealership user and profile.

### 2.2 Get Dealership List
- **Endpoint:** `GET /`
- **Query:** `?page=1&limit=10&status=approved`
- **Response:** Paginated list.

### 2.3 Search Dealerships
- **Endpoint:** `GET /search`
- **Query:** `?query=abc`

### 2.4 Get Dealership Details
- **Endpoint:** `GET /:id`

### 2.5 Update Dealership Status
- **Endpoint:** `PATCH /:id/status`
- **Body:** `{ "status": "approved", "remarks": "Looks good" }`

### 2.6 Dashboard Statistics
- **Endpoint:** `GET /api/v1/admin/dashboard/statistics`

---

## 3. Dealership Module (Retailer Onboarding)
**Base URL:** `/api/v1/dealerships`
**Auth Required:** Yes (`DEALERSHIP` role + `APPROVED` status)

### 3.1 Dealership Profile Update
- **Endpoint:** `PUT /profile`
- **Body:** `{ "gstNumber": "...", "panNumber": "...", "address": { ... } }`

### 3.2 Create Retailer
- **Endpoint:** `POST /retailers`
- **Body:** `{ "storeName": "R1", "ownerName": "O1", "email": "r1@ex.com", "phone": "123", "password": "pass" }`

### 3.3 Get Retailer List
- **Endpoint:** `GET /retailers`

### 3.4 Verify Retailer
- **Endpoint:** `PATCH /retailers/:id/verify`
- **Body:** `{ "verificationStatus": "VERIFIED" }`

### 3.5 Update Retailer Status
- **Endpoint:** `PATCH /retailers/:id/status`
- **Body:** `{ "status": "SUSPENDED" }`

### 3.6 Dealership Dashboard
- **Endpoint:** `GET /dashboard/overview`

---

## 4. Retailer Module (Customer Onboarding)
**Base URL:** `/api/v1/retailers`
**Auth Required:** Yes (`RETAILER` role + `VERIFIED` status)

### 4.1 Register Customer (In-Store Onboarding)
- **Endpoint:** `POST /customers`
- **Body:** `{ "name": "John", "email": "john@ex.com", "mobile": "9999999999", "password": "pass", "address": "St", "city": "C", "state": "S", "pincode": "123" }`
- **Response:** Access and Refresh Tokens, User Profile for the new customer.

### 4.2 Get Customer List
- **Endpoint:** `GET /customers`

### 4.3 Search Customers
- **Endpoint:** `GET /customers/search`

### 4.4 Retailer Dashboard
- **Endpoint:** `GET /dashboard/summary`

---

## 5. Inventory Management Module (Phase 1)
**Base URL:** `/api/admin/inventory` (or `/api/v1/admin/inventory`)
**Auth Required:** Yes (`ADMIN` role)

### 5.1 Add Inventory
- **Endpoint:** `POST /`
- **Body:**
```json
{
  "productName": "Dell Latitude 5420 Refurbished",
  "brand": "Dell",
  "model": "Latitude 5420",
  "category": "Laptops",
  "sku": "DELL-LAT-5420-001",
  "serialNumber": "SN-987654321",
  "totalStockQuantity": 15,
  "availableStock": 15,
  "remarks": "Grade A Condition"
}
```

### 5.2 Get Inventory List
- **Endpoint:** `GET /`
- **Query Params:** `?page=1&limit=10&search=Dell&brand=Dell&category=Laptops&status=In Stock&sort=-createdAt`

### 5.3 Get Low Stock Items
- **Endpoint:** `GET /low-stock`
- **Query Params:** `?page=1&limit=10&search=Dell`

### 5.4 Get Out of Stock Items
- **Endpoint:** `GET /out-of-stock`
- **Query Params:** `?page=1&limit=10`

### 5.5 Get Inventory Item by ID
- **Endpoint:** `GET /:inventoryId`

### 5.6 Update Inventory
- **Endpoint:** `PUT /:inventoryId`
- **Body:**
```json
{
  "productName": "Dell Latitude 5420 Refurbished (Updated)",
  "totalStockQuantity": 20,
  "availableStock": 18,
  "remarks": "Updated stock and details"
}
```

### 5.7 Delete Inventory
- **Endpoint:** `DELETE /:inventoryId`

### 5.8 Increase Stock
- **Endpoint:** `PATCH /:inventoryId/increase-stock`
- **Body:** `{ "amount": 5 }`

### 5.9 Decrease Stock
- **Endpoint:** `PATCH /:inventoryId/decrease-stock`
- **Body:** `{ "amount": 2 }`

### 5.10 Direct Stock Update
- **Endpoint:** `PATCH /:inventoryId/update-stock`
- **Body:** `{ "totalStockQuantity": 25, "availableStock": 20 }`

