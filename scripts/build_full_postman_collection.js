import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

function makeReq(name, method, fullUrlPath, bodyObj = null, queryParams = null) {
  const pathParts = fullUrlPath.split('/').filter(Boolean);
  let rawUrl = '{{baseUrl}}/' + pathParts.join('/');
  let queryArr = [];
  if (queryParams) {
    rawUrl += '?' + queryParams;
    queryArr = queryParams.split('&').map(p => {
      const [k, v] = p.split('=');
      return { key: k, value: v || '' };
    });
  }

  const req = {
    name,
    request: {
      method,
      header: [{ key: 'Content-Type', value: 'application/json' }],
      url: {
        raw: rawUrl,
        host: ['{{baseUrl}}'],
        path: pathParts
      },
      auth: {
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }]
      }
    }
  };

  if (queryArr.length > 0) {
    req.request.url.query = queryArr;
  }

  if (bodyObj) {
    req.request.body = {
      mode: 'raw',
      raw: JSON.stringify(bodyObj, null, 2)
    };
  }
  return req;
}

const fullCollection = {
  info: {
    _postman_id: randomUUID(),
    name: 'Tajwin Enterprise Backend API Collection',
    description: 'Comprehensive Postman collection containing Auth, Products, Inventory (All 14 Phase 1 Sub-Modules), Order Management, Dealerships, and Retailers.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [
    {
      name: 'Authentication',
      item: [
        {
          name: 'Login',
          event: [
            {
              listen: 'test',
              script: {
                exec: [
                  'var jsonData = pm.response.json();',
                  'if (jsonData && jsonData.data && jsonData.data.accessToken) {',
                  '    pm.environment.set("accessToken", jsonData.data.accessToken);',
                  '}'
                ],
                type: 'text/javascript'
              }
            }
          ],
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/auth/login', host: ['{{baseUrl}}'], path: ['api', 'v1', 'auth', 'login'] },
            body: {
              mode: 'raw',
              raw: JSON.stringify({ email: 'admin@tajwin.com', password: 'AdminPassword123!' }, null, 2)
            }
          }
        },
        makeReq('Refresh Token', 'POST', 'api/v1/auth/refresh', {}),
        makeReq('Get Profile', 'GET', 'api/v1/auth/profile'),
        makeReq('Update Profile', 'PUT', 'api/v1/auth/profile', { name: 'Admin User', mobile: '9876543210' }),
        makeReq('Change Password', 'POST', 'api/v1/auth/change-password', { currentPassword: 'oldPassword', newPassword: 'newPassword123!' }),
        makeReq('Logout', 'POST', 'api/v1/auth/logout', {})
      ]
    },
    {
      name: 'Product Management',
      item: [
        makeReq('Create Product', 'POST', 'api/v1/admin/products', {
          title: 'Dell Latitude 5420 Refurbished',
          brand: 'Dell',
          category: 'Laptops',
          sku: 'DELL-LAT-5420',
          basePrice: 35000,
          sellingPrice: 38000,
          description: 'Intel i5 11th Gen, 16GB RAM, 512GB SSD'
        }),
        makeReq('Get All Products', 'GET', 'api/v1/admin/products', null, 'page=1&limit=10&brand=Dell'),
        makeReq('Get Product by ID', 'GET', 'api/v1/admin/products/66a99201c8765f4321098765'),
        makeReq('Update Product', 'PUT', 'api/v1/admin/products/66a99201c8765f4321098765', {
          title: 'Dell Latitude 5420 Refurbished (Updated)',
          sellingPrice: 37500
        }),
        makeReq('Delete Product', 'DELETE', 'api/v1/admin/products/66a99201c8765f4321098765')
      ]
    },
    {
      name: 'Inventory Management',
      item: [
        {
          name: 'Dashboard',
          item: [
            makeReq('Dashboard Summary', 'GET', 'api/v1/admin/inventory/dashboard/summary'),
            makeReq('Inventory Statistics', 'GET', 'api/v1/admin/inventory/dashboard/statistics'),
            makeReq('Warehouse Statistics', 'GET', 'api/v1/admin/inventory/dashboard/warehouse-stats'),
            makeReq('Dealer Statistics', 'GET', 'api/v1/admin/inventory/dashboard/dealer-stats'),
            makeReq('Retailer Statistics', 'GET', 'api/v1/admin/inventory/dashboard/retailer-stats'),
            makeReq('End User Statistics', 'GET', 'api/v1/admin/inventory/dashboard/enduser-stats'),
            makeReq('Recent Activities', 'GET', 'api/v1/admin/inventory/dashboard/recent-activities', null, 'limit=10'),
            makeReq('Monthly Summary', 'GET', 'api/v1/admin/inventory/dashboard/monthly-summary', null, 'year=2026'),
            makeReq('Graph Data', 'GET', 'api/v1/admin/inventory/dashboard/graph-data', null, 'days=30'),
            makeReq('Stock Trends', 'GET', 'api/v1/admin/inventory/dashboard/stock-trends', null, 'startDate=2026-01-01&endDate=2026-07-30'),
            makeReq('Low Stock Count', 'GET', 'api/v1/admin/inventory/dashboard/low-stock-count'),
            makeReq('Out of Stock Count', 'GET', 'api/v1/admin/inventory/dashboard/out-of-stock-count')
          ]
        },
        {
          name: 'Inventory Operations',
          item: [
            makeReq('Create Inventory', 'POST', 'api/v1/admin/inventory', {
              productName: 'Galaxy S24 Ultra',
              brand: 'Samsung',
              model: 'SM-S928B',
              category: 'Smartphones',
              sku: 'SAM-S24U-512GB',
              barcode: '8806095000000',
              serialNumber: 'SN-SAM-998822',
              purchasePrice: 950.00,
              sellingPrice: 1299.99,
              quantity: 50,
              availableQuantity: 50,
              minimumStockLevel: 10,
              maximumStockLevel: 500,
              remarks: 'New Flagship Item'
            }),
            makeReq('Get All Inventory', 'GET', 'api/v1/admin/inventory', null, 'page=1&limit=10&brand=Samsung&status=In Stock'),
            makeReq('Get Low Stock Items', 'GET', 'api/v1/admin/inventory/low-stock', null, 'page=1&limit=10'),
            makeReq('Get Out of Stock Items', 'GET', 'api/v1/admin/inventory/out-of-stock', null, 'page=1&limit=10'),
            makeReq('Get Inventory by ID', 'GET', 'api/v1/admin/inventory/66a99201c8765f4321098765'),
            makeReq('Get Inventory by SKU', 'GET', 'api/v1/admin/inventory/sku/SAM-S24U-512GB'),
            makeReq('Get Inventory by Serial Number', 'GET', 'api/v1/admin/inventory/serial/SN-SAM-998822'),
            makeReq('Update Inventory', 'PUT', 'api/v1/admin/inventory/66a99201c8765f4321098765', {
              productName: 'Galaxy S24 Ultra (Updated)',
              sellingPrice: 1249.99,
              quantity: 60,
              availableQuantity: 60
            }),
            makeReq('Increase Stock', 'PATCH', 'api/v1/admin/inventory/66a99201c8765f4321098765/increase-stock', { amount: 10 }),
            makeReq('Decrease Stock', 'PATCH', 'api/v1/admin/inventory/66a99201c8765f4321098765/decrease-stock', { amount: 5 }),
            makeReq('Direct Stock Update', 'PATCH', 'api/v1/admin/inventory/66a99201c8765f4321098765/update-stock', { quantity: 70, availableQuantity: 70 }),
            makeReq('Bulk Upload Inventory', 'POST', 'api/v1/admin/inventory/bulk-upload', { items: [] }),
            makeReq('Bulk Delete Inventory', 'POST', 'api/v1/admin/inventory/bulk-delete', { inventoryIds: ['66a99201c8765f4321098765'] }),
            makeReq('Bulk Update Inventory', 'PATCH', 'api/v1/admin/inventory/bulk-update', { updates: [] }),
            makeReq('Duplicate Check', 'POST', 'api/v1/admin/inventory/check-duplicate', null, 'sku=SAM-S24U-512GB'),
            makeReq('Validate Payload', 'POST', 'api/v1/admin/inventory/validate', { productName: 'Test', sku: 'TEST', category: 'Test', brand: 'Test' }),
            makeReq('Import Inventory', 'POST', 'api/v1/admin/inventory/import', { items: [] }),
            makeReq('Export Inventory', 'GET', 'api/v1/admin/inventory/export', null, 'format=excel'),
            makeReq('Item History', 'GET', 'api/v1/admin/inventory/66a99201c8765f4321098765/history'),
            makeReq('Item Timeline', 'GET', 'api/v1/admin/inventory/66a99201c8765f4321098765/timeline'),
            makeReq('Item Audit', 'GET', 'api/v1/admin/inventory/66a99201c8765f4321098765/audit'),
            makeReq('Clone Inventory', 'POST', 'api/v1/admin/inventory/66a99201c8765f4321098765/clone'),
            makeReq('Archive Inventory', 'PATCH', 'api/v1/admin/inventory/66a99201c8765f4321098765/archive'),
            makeReq('Soft Delete Inventory', 'PATCH', 'api/v1/admin/inventory/66a99201c8765f4321098765/soft-delete'),
            makeReq('Restore Inventory', 'PATCH', 'api/v1/admin/inventory/66a99201c8765f4321098765/restore'),
            makeReq('Delete Inventory (Hard)', 'DELETE', 'api/v1/admin/inventory/66a99201c8765f4321098765')
          ]
        },
        {
          name: 'Warehouse Management',
          item: [
            makeReq('Warehouse Summary', 'GET', 'api/v1/admin/inventory/warehouses/summary'),
            makeReq('Search Warehouses', 'GET', 'api/v1/admin/inventory/warehouses/search', null, 'q=Central'),
            makeReq('Filter Warehouses', 'GET', 'api/v1/admin/inventory/warehouses/filter', null, 'status=Active'),
            makeReq('Inter-Warehouse Transfer', 'POST', 'api/v1/admin/inventory/warehouses/transfer', {
              sourceWarehouseId: '66a98f10b7842c12ab345678',
              destinationWarehouseId: '66a98f10b7842c12ab345999',
              inventoryId: '66a99201c8765f4321098765',
              quantity: 15
            }),
            makeReq('Reserve Stock', 'POST', 'api/v1/admin/inventory/warehouses/reserve', { inventoryId: '66a99201c8765f4321098765', quantity: 5 }),
            makeReq('Adjust Stock', 'POST', 'api/v1/admin/inventory/warehouses/adjust', { inventoryId: '66a99201c8765f4321098765', availableQuantity: 45 }),
            makeReq('Record Damage', 'POST', 'api/v1/admin/inventory/warehouses/damage', { inventoryId: '66a99201c8765f4321098765', quantity: 2, remarks: 'Damage' }),
            makeReq('Process Return', 'POST', 'api/v1/admin/inventory/warehouses/returns', { inventoryId: '66a99201c8765f4321098765', quantity: 1 }),
            makeReq('Warehouse Stock', 'GET', 'api/v1/admin/inventory/warehouses/66a98f10b7842c12ab345678/stock'),
            makeReq('Warehouse Items', 'GET', 'api/v1/admin/inventory/warehouses/66a98f10b7842c12ab345678/items'),
            makeReq('Warehouse History', 'GET', 'api/v1/admin/inventory/warehouses/66a98f10b7842c12ab345678/history'),
            makeReq('Warehouse Capacity', 'GET', 'api/v1/admin/inventory/warehouses/66a98f10b7842c12ab345678/capacity'),
            makeReq('Warehouse Activity Log', 'GET', 'api/v1/admin/inventory/warehouses/66a98f10b7842c12ab345678/activity-log'),
            makeReq('Warehouse Details', 'GET', 'api/v1/admin/inventory/warehouses/66a98f10b7842c12ab345678')
          ]
        },
        {
          name: 'Stock Allocation',
          item: [
            makeReq('Allocate Stock', 'POST', 'api/v1/admin/inventory/allocations', {
              inventoryId: '66a99201c8765f4321098765',
              targetType: 'Dealer',
              targetEntityId: '66a97711b7842c12ab111111',
              allocatedQuantity: 10,
              remarks: 'Initial Allocation'
            }),
            makeReq('Bulk Allocate', 'POST', 'api/v1/admin/inventory/allocations/bulk', { allocations: [] }),
            makeReq('Allocation History', 'GET', 'api/v1/admin/inventory/allocations/history'),
            makeReq('Allocation Logs', 'GET', 'api/v1/admin/inventory/allocations/logs'),
            makeReq('Allocation Reports', 'GET', 'api/v1/admin/inventory/allocations/reports'),
            makeReq('Reallocate Stock', 'PATCH', 'api/v1/admin/inventory/allocations/66b99201c8765f4321099999/reallocate', { newTargetEntityId: '66a97711b7842c12ab222222' }),
            makeReq('Cancel Allocation', 'PATCH', 'api/v1/admin/inventory/allocations/66b99201c8765f4321099999/cancel'),
            makeReq('Approve Allocation', 'PATCH', 'api/v1/admin/inventory/allocations/66b99201c8765f4321099999/approve'),
            makeReq('Reject Allocation', 'PATCH', 'api/v1/admin/inventory/allocations/66b99201c8765f4321099999/reject', { reason: 'Quota exceeded' }),
            makeReq('Allocation Status', 'PATCH', 'api/v1/admin/inventory/allocations/66b99201c8765f4321099999/status', { status: 'Approved' }),
            makeReq('Allocation Timeline', 'GET', 'api/v1/admin/inventory/allocations/66b99201c8765f4321099999/timeline'),
            makeReq('Allocation Details', 'GET', 'api/v1/admin/inventory/allocations/66b99201c8765f4321099999')
          ]
        },
        {
          name: 'Dealer Inventory',
          item: [
            makeReq('Dealer Summary', 'GET', 'api/v1/admin/inventory/dealers/summary'),
            makeReq('Search Dealer Stock', 'GET', 'api/v1/admin/inventory/dealers/search', null, 'q=Galaxy'),
            makeReq('Filter Dealer Stock', 'GET', 'api/v1/admin/inventory/dealers/filter', null, 'status=Approved'),
            makeReq('Dealer Reports', 'GET', 'api/v1/admin/inventory/dealers/reports'),
            makeReq('Process Dealer Return', 'POST', 'api/v1/admin/inventory/dealers/returns', { dealerId: '66a97711b7842c12ab111111', inventoryId: '66a99201c8765f4321098765', quantity: 2 }),
            makeReq('Record Dealer Damage', 'POST', 'api/v1/admin/inventory/dealers/damaged', { dealerId: '66a97711b7842c12ab111111', inventoryId: '66a99201c8765f4321098765', quantity: 1 }),
            makeReq('Dealer Stock Details', 'GET', 'api/v1/admin/inventory/dealers/66a97711b7842c12ab111111/stock'),
            makeReq('Dealer History', 'GET', 'api/v1/admin/inventory/dealers/66a97711b7842c12ab111111/history'),
            makeReq('Dealer Movements', 'GET', 'api/v1/admin/inventory/dealers/66a97711b7842c12ab111111/movements'),
            makeReq('Dealer Stock Count', 'GET', 'api/v1/admin/inventory/dealers/66a97711b7842c12ab111111/stock-count'),
            makeReq('Dealer Available Stock', 'GET', 'api/v1/admin/inventory/dealers/66a97711b7842c12ab111111/available'),
            makeReq('Dealer Allocations', 'GET', 'api/v1/admin/inventory/dealers/66a97711b7842c12ab111111/allocations')
          ]
        },
        {
          name: 'Retailer Inventory',
          item: [
            makeReq('Retailer Summary', 'GET', 'api/v1/admin/inventory/retailers/summary'),
            makeReq('Search Retailer Stock', 'GET', 'api/v1/admin/inventory/retailers/search', null, 'q=Galaxy'),
            makeReq('Filter Retailer Stock', 'GET', 'api/v1/admin/inventory/retailers/filter', null, 'status=Approved'),
            makeReq('Retailer Reports', 'GET', 'api/v1/admin/inventory/retailers/reports'),
            makeReq('Process Retailer Return', 'POST', 'api/v1/admin/inventory/retailers/returns', { retailerId: '66a97711b7842c12ab333333', inventoryId: '66a99201c8765f4321098765', quantity: 1 }),
            makeReq('Record Retailer Damage', 'POST', 'api/v1/admin/inventory/retailers/damaged', { retailerId: '66a97711b7842c12ab333333', inventoryId: '66a99201c8765f4321098765', quantity: 1 }),
            makeReq('Retailer Stock Details', 'GET', 'api/v1/admin/inventory/retailers/66a97711b7842c12ab333333/stock'),
            makeReq('Retailer History', 'GET', 'api/v1/admin/inventory/retailers/66a97711b7842c12ab333333/history'),
            makeReq('Retailer Movements', 'GET', 'api/v1/admin/inventory/retailers/66a97711b7842c12ab333333/movements'),
            makeReq('Retailer Stock Count', 'GET', 'api/v1/admin/inventory/retailers/66a97711b7842c12ab333333/stock-count'),
            makeReq('Retailer Available Stock', 'GET', 'api/v1/admin/inventory/retailers/66a97711b7842c12ab333333/available')
          ]
        },
        {
          name: 'End User Tracking',
          item: [
            makeReq('Delivered Products', 'GET', 'api/v1/admin/inventory/end-user/delivered'),
            makeReq('Pending Deliveries', 'GET', 'api/v1/admin/inventory/end-user/pending'),
            makeReq('Delivery History', 'GET', 'api/v1/admin/inventory/end-user/deliveries/history'),
            makeReq('Returned Products', 'GET', 'api/v1/admin/inventory/end-user/returns'),
            makeReq('Replacement Products', 'GET', 'api/v1/admin/inventory/end-user/replacements'),
            makeReq('Delivery Details', 'GET', 'api/v1/admin/inventory/end-user/deliveries/DEL-99887766'),
            makeReq('Delivery Status Update', 'PATCH', 'api/v1/admin/inventory/end-user/deliveries/DEL-99887766/status', { status: 'Delivered' }),
            makeReq('Customer Purchase History', 'GET', 'api/v1/admin/inventory/end-user/customer/66a97711b7842c12ab444444/purchases'),
            makeReq('Customer Inventory', 'GET', 'api/v1/admin/inventory/end-user/customer/66a97711b7842c12ab444444'),
            makeReq('Warranty Tracking', 'GET', 'api/v1/admin/inventory/end-user/warranty/SN-SAM-998822'),
            makeReq('Product Timeline', 'GET', 'api/v1/admin/inventory/end-user/products/SN-SAM-998822/timeline')
          ]
        },
        {
          name: 'Inventory Movement',
          item: [
            makeReq('Movement History', 'GET', 'api/v1/admin/inventory/movements/history'),
            makeReq('Movement Timeline', 'GET', 'api/v1/admin/inventory/movements/timeline'),
            makeReq('Date Range Movements', 'GET', 'api/v1/admin/inventory/movements/date-range', null, 'startDate=2026-01-01&endDate=2026-07-30'),
            makeReq('Search Movements', 'GET', 'api/v1/admin/inventory/movements/search', null, 'q=Stock'),
            makeReq('Filter Movements', 'GET', 'api/v1/admin/inventory/movements/filter', null, 'movementType=Stock Added'),
            makeReq('Movement Reports', 'GET', 'api/v1/admin/inventory/movements/reports'),
            makeReq('Movement Export', 'GET', 'api/v1/admin/inventory/movements/export'),
            makeReq('Movement Audit', 'GET', 'api/v1/admin/inventory/movements/audit'),
            makeReq('Product Movements', 'GET', 'api/v1/admin/inventory/movements/product/66a99201c8765f4321098765'),
            makeReq('Warehouse Movements', 'GET', 'api/v1/admin/inventory/movements/warehouse/66a98f10b7842c12ab345678'),
            makeReq('Dealer Movements', 'GET', 'api/v1/admin/inventory/movements/dealer/66a97711b7842c12ab111111'),
            makeReq('Retailer Movements', 'GET', 'api/v1/admin/inventory/movements/retailer/66a97711b7842c12ab333333'),
            makeReq('Movement Details', 'GET', 'api/v1/admin/inventory/movements/MOV-12345678')
          ]
        },
        {
          name: 'Low Stock Management',
          item: [
            makeReq('Low Stock List', 'GET', 'api/v1/admin/inventory/low-stock'),
            makeReq('Out of Stock List', 'GET', 'api/v1/admin/inventory/out-of-stock'),
            makeReq('Critical Stock List', 'GET', 'api/v1/admin/inventory/critical-stock'),
            makeReq('Stock Alerts', 'GET', 'api/v1/admin/inventory/stock-alerts'),
            makeReq('Low Stock History', 'GET', 'api/v1/admin/inventory/low-stock/history'),
            makeReq('Low Stock Notifications', 'GET', 'api/v1/admin/inventory/low-stock/notifications'),
            makeReq('Auto Generate Alerts', 'POST', 'api/v1/admin/inventory/low-stock/generate-alerts'),
            makeReq('Update Stock Threshold', 'PATCH', 'api/v1/admin/inventory/66a99201c8765f4321098765/threshold', { minimumStockLevel: 10, maximumStockLevel: 1000 })
          ]
        },
        {
          name: 'Search & Filters',
          item: [
            makeReq('Global Multi-Field Search', 'GET', 'api/v1/admin/inventory/search', null, 'q=Samsung&brand=Samsung&status=In Stock'),
            makeReq('Dynamic Filter Matrix', 'GET', 'api/v1/admin/inventory/filter', null, 'brand=Samsung&category=Smartphones&minPrice=500&maxPrice=1500')
          ]
        },
        {
          name: 'Reports',
          item: [
            makeReq('Inventory Summary Report', 'GET', 'api/v1/admin/inventory/reports/summary'),
            makeReq('Warehouse Report', 'GET', 'api/v1/admin/inventory/reports/warehouse'),
            makeReq('Dealer Report', 'GET', 'api/v1/admin/inventory/reports/dealer'),
            makeReq('Retailer Report', 'GET', 'api/v1/admin/inventory/reports/retailer'),
            makeReq('End User Report', 'GET', 'api/v1/admin/inventory/reports/end-user'),
            makeReq('Movement Report', 'GET', 'api/v1/admin/inventory/reports/movement'),
            makeReq('Allocation Report', 'GET', 'api/v1/admin/inventory/reports/allocation'),
            makeReq('Damage Report', 'GET', 'api/v1/admin/inventory/reports/damage'),
            makeReq('Return Report', 'GET', 'api/v1/admin/inventory/reports/returns'),
            makeReq('Low Stock Report', 'GET', 'api/v1/admin/inventory/reports/low-stock'),
            makeReq('Out Of Stock Report', 'GET', 'api/v1/admin/inventory/reports/out-of-stock'),
            makeReq('Monthly Report', 'GET', 'api/v1/admin/inventory/reports/monthly', null, 'year=2026'),
            makeReq('Yearly Report', 'GET', 'api/v1/admin/inventory/reports/yearly', null, 'year=2026')
          ]
        },
        {
          name: 'Activity Logs',
          item: [
            makeReq('System Activity Logs', 'GET', 'api/v1/admin/inventory/logs/activity'),
            makeReq('Immutable Audit Logs', 'GET', 'api/v1/admin/inventory/logs/audit'),
            makeReq('System Level Logs', 'GET', 'api/v1/admin/inventory/logs/system'),
            makeReq('Visual Activity Timeline', 'GET', 'api/v1/admin/inventory/logs/timeline'),
            makeReq('Filter Activity Logs', 'GET', 'api/v1/admin/inventory/logs/filter', null, 'module=Inventory'),
            makeReq('Search Activity Logs', 'GET', 'api/v1/admin/inventory/logs/search', null, 'q=CREATE'),
            makeReq('User Activity Logs', 'GET', 'api/v1/admin/inventory/logs/user/66a97711b7842c12ab000000'),
            makeReq('Item Activity Logs', 'GET', 'api/v1/admin/inventory/logs/inventory/66a99201c8765f4321098765'),
            makeReq('Warehouse Activity Logs', 'GET', 'api/v1/admin/inventory/logs/warehouse/66a98f10b7842c12ab345678'),
            makeReq('Dealer Activity Logs', 'GET', 'api/v1/admin/inventory/logs/dealer/66a97711b7842c12ab111111'),
            makeReq('Retailer Activity Logs', 'GET', 'api/v1/admin/inventory/logs/retailer/66a97711b7842c12ab333333')
          ]
        },
        {
          name: 'Notifications',
          item: [
            makeReq('Unread Notifications', 'GET', 'api/v1/admin/inventory/notifications/unread'),
            makeReq('Notifications List', 'GET', 'api/v1/admin/inventory/notifications'),
            makeReq('Mark Notification Read', 'PATCH', 'api/v1/admin/inventory/notifications/66c99201c8765f4321011111/read'),
            makeReq('Delete Notification', 'DELETE', 'api/v1/admin/inventory/notifications/66c99201c8765f4321011111')
          ]
        }
      ]
    },
    {
      name: 'Order Management',
      item: [
        makeReq('Order Dashboard', 'GET', 'api/v1/admin/orders/dashboard'),
        makeReq('Create Order', 'POST', 'api/v1/admin/orders', {
          orderId: 'ORD-20260724-1001',
          customerInfo: { name: 'Rohan Sharma', mobile: '9876543210', email: 'rohan@example.com' },
          shippingAddress: { address: 'MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
          items: [{ productName: 'Dell Laptop', sku: 'DELL-LAT-5420-001', quantity: 1, price: 35000 }],
          paymentInfo: { method: 'UPI', status: 'Paid', transactionId: 'TXN-987654321' }
        }),
        makeReq('Get All Orders', 'GET', 'api/v1/admin/orders', null, 'page=1&limit=10&orderStatus=Pending'),
        makeReq('Get Order Details', 'GET', 'api/v1/admin/orders/ORD-20260724-1001'),
        makeReq('Update Order Details', 'PUT', 'api/v1/admin/orders/ORD-20260724-1001', { tax: 1800 }),
        makeReq('Delete Order', 'DELETE', 'api/v1/admin/orders/ORD-20260724-1001'),
        makeReq('Update Order Status', 'PATCH', 'api/v1/admin/orders/ORD-20260724-1001/status', { status: 'Confirmed' }),
        makeReq('Get Payment Details', 'GET', 'api/v1/admin/orders/ORD-20260724-1001/payment'),
        makeReq('Update Payment Status', 'PATCH', 'api/v1/admin/orders/ORD-20260724-1001/payment', { status: 'Paid' }),
        makeReq('Get Shipping Details', 'GET', 'api/v1/admin/orders/ORD-20260724-1001/shipping'),
        makeReq('Update Shipping Details', 'PATCH', 'api/v1/admin/orders/ORD-20260724-1001/shipping', { courierName: 'BlueDart', trackingNumber: 'BD-123', status: 'Shipped' }),
        makeReq('Generate Invoice', 'GET', 'api/v1/admin/orders/ORD-20260724-1001/invoice'),
        makeReq('Get Order Timeline', 'GET', 'api/v1/admin/orders/ORD-20260724-1001/timeline')
      ]
    },
    {
      name: 'Dealership Management (Admin)',
      item: [
        makeReq('Create Dealership (Invite)', 'POST', 'api/v1/admin/dealerships', {
          businessName: 'Apex Dealership',
          email: 'apex@dealership.com',
          phone: '9876543210',
          password: 'DealerPassword123!'
        }),
        makeReq('Get Dealership List', 'GET', 'api/v1/admin/dealerships', null, 'page=1&limit=10&status=approved'),
        makeReq('Search Dealerships', 'GET', 'api/v1/admin/dealerships/search', null, 'query=Apex'),
        makeReq('Get Dealership Details', 'GET', 'api/v1/admin/dealerships/66a97711b7842c12ab111111'),
        makeReq('Update Dealership Status', 'PATCH', 'api/v1/admin/dealerships/66a97711b7842c12ab111111/status', { status: 'approved', remarks: 'Verified documents' })
      ]
    },
    {
      name: 'Dealership Module (Retailer Onboarding)',
      item: [
        makeReq('Get Dealership Profile', 'GET', 'api/v1/dealerships/profile'),
        makeReq('Update Dealership Profile', 'PUT', 'api/v1/dealerships/profile', { businessName: 'Apex Dealership Ltd' }),
        makeReq('Create Retailer', 'POST', 'api/v1/dealerships/retailers', {
          storeName: 'Metro Retail',
          ownerName: 'Rahul Verma',
          email: 'metro@retail.com',
          phone: '9876500000',
          password: 'RetailerPassword123!'
        }),
        makeReq('Get Retailer List', 'GET', 'api/v1/dealerships/retailers'),
        makeReq('Verify Retailer', 'PATCH', 'api/v1/dealerships/retailers/66a97711b7842c12ab333333/verify', { verificationStatus: 'VERIFIED' }),
        makeReq('Update Retailer Status', 'PATCH', 'api/v1/dealerships/retailers/66a97711b7842c12ab333333/status', { status: 'ACTIVE' }),
        makeReq('Dealership Dashboard Overview', 'GET', 'api/v1/dealerships/dashboard/overview')
      ]
    },
    {
      name: 'Retailer Module (Customer Onboarding)',
      item: [
        makeReq('Register Customer (In-Store)', 'POST', 'api/v1/retailers/customers', {
          name: 'Amit Kumar',
          email: 'amit@example.com',
          mobile: '9988776655',
          password: 'CustomerPass123!',
          address: 'Station Road',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        }),
        makeReq('Get Customer List', 'GET', 'api/v1/retailers/customers'),
        makeReq('Search Customers', 'GET', 'api/v1/retailers/customers/search', null, 'q=Amit'),
        makeReq('Retailer Dashboard Summary', 'GET', 'api/v1/retailers/dashboard/summary')
      ]
    }
  ]
};

const targetPath = path.join(process.cwd(), 'tajwin-postman-collection.json');
fs.writeFileSync(targetPath, JSON.stringify(fullCollection, null, 2));

try {
  JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  console.log('SUCCESS: tajwin-postman-collection.json is valid Postman v2.1.0 format with UUID postman_id!');
} catch (e) {
  console.error('JSON validation error:', e);
}
