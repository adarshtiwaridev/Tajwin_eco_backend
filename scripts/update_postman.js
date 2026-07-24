import fs from 'fs';
import path from 'path';

const postmanPath = path.resolve('tajwin-postman-collection.json');
const collection = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

// Update collection name & description
collection.info.name = "Tajwin - Admin API Collection (Auth, Products, Inventory & Orders)";
collection.info.description = "Complete collection containing Auth, Product Management, Inventory Management, and Order Management (Phase 1) endpoints with pre-filled test payloads.";

const inventoryFolder = {
  name: "Inventory",
  item: [
    {
      name: "Add Inventory",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory"]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              productName: "Dell Latitude 5420 Refurbished",
              brand: "Dell",
              model: "Latitude 5420",
              category: "Laptops",
              sku: "DELL-LAT-5420-001",
              serialNumber: "SN-987654321",
              totalStockQuantity: 15,
              availableStock: 15,
              remarks: "Grade A Condition"
            },
            null,
            2
          )
        }
      }
    },
    {
      name: "Get Inventory List",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory?page=1&limit=10&search=Dell",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory"],
          query: [
            { key: "page", value: "1" },
            { key: "limit", value: "10" },
            { key: "search", value: "Dell" },
            { key: "brand", value: "Dell", disabled: true },
            { key: "category", value: "Laptops", disabled: true },
            { key: "status", value: "In Stock", disabled: true }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Get Low Stock Items",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/low-stock?page=1&limit=10",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", "low-stock"],
          query: [
            { key: "page", value: "1" },
            { key: "limit", value: "10" }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Get Out of Stock Items",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/out-of-stock?page=1&limit=10",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", "out-of-stock"],
          query: [
            { key: "page", value: "1" },
            { key: "limit", value: "10" }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Get Inventory by ID",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId"],
          variable: [{ key: "inventoryId", value: "INVENTORY_ID_HERE" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Update Inventory",
      request: {
        method: "PUT",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId"],
          variable: [{ key: "inventoryId", value: "INVENTORY_ID_HERE" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              productName: "Dell Latitude 5420 Refurbished (Updated)",
              totalStockQuantity: 20,
              availableStock: 18,
              remarks: "Updated stock and details"
            },
            null,
            2
          )
        }
      }
    },
    {
      name: "Delete Inventory",
      request: {
        method: "DELETE",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId"],
          variable: [{ key: "inventoryId", value: "INVENTORY_ID_HERE" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Increase Stock",
      request: {
        method: "PATCH",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId/increase-stock",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId", "increase-stock"],
          variable: [{ key: "inventoryId", value: "INVENTORY_ID_HERE" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify({ amount: 5 }, null, 2)
        }
      }
    },
    {
      name: "Decrease Stock",
      request: {
        method: "PATCH",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId/decrease-stock",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId", "decrease-stock"],
          variable: [{ key: "inventoryId", value: "INVENTORY_ID_HERE" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify({ amount: 2 }, null, 2)
        }
      }
    },
    {
      name: "Direct Stock Update",
      request: {
        method: "PATCH",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId/update-stock",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId", "update-stock"],
          variable: [{ key: "inventoryId", value: "INVENTORY_ID_HERE" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify({ totalStockQuantity: 25, availableStock: 20 }, null, 2)
        }
      }
    }
  ]
};

const orderFolder = {
  name: "Order Management (Phase 1)",
  item: [
    {
      name: "Order Dashboard Statistics",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/dashboard",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", "dashboard"]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Create Order",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders"]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              customerInfo: {
                name: "Rohan Sharma",
                mobile: "9876543210",
                email: "rohan.sharma@example.com"
              },
              shippingAddress: {
                address: "Flat 402, Green Park Apartments, MG Road",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001"
              },
              items: [
                {
                  productName: "Dell Latitude 5420 Refurbished",
                  sku: "DELL-LAT-5420-001",
                  quantity: 1,
                  price: 35000
                }
              ],
              paymentInfo: {
                method: "UPI",
                status: "Paid",
                transactionId: "TXN-987654321"
              },
              tax: 1800,
              shippingCharge: 250,
              discount: 500
            },
            null,
            2
          )
        }
      }
    },
    {
      name: "Get All Orders (Listing & Search)",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders?page=1&limit=10&search=Rohan",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders"],
          query: [
            { key: "page", value: "1" },
            { key: "limit", value: "10" },
            { key: "search", value: "Rohan" },
            { key: "orderStatus", value: "Pending", disabled: true },
            { key: "paymentStatus", value: "Paid", disabled: true },
            { key: "shippingStatus", value: "Pending", disabled: true },
            { key: "paymentMethod", value: "UPI", disabled: true },
            { key: "startDate", value: "2026-07-01", disabled: true },
            { key: "endDate", value: "2026-07-31", disabled: true },
            { key: "sort", value: "-createdAt", disabled: true }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Get Order Details",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Update Order Details",
      request: {
        method: "PUT",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              customerInfo: {
                name: "Rohan Sharma (Updated)",
                mobile: "9876543210",
                email: "rohan.updated@example.com"
              },
              tax: 2000,
              discount: 700
            },
            null,
            2
          )
        }
      }
    },
    {
      name: "Delete Order",
      request: {
        method: "DELETE",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Update Order Status",
      request: {
        method: "PATCH",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId/status",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId", "status"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              status: "Confirmed",
              remarks: "Order confirmed after payment verification"
            },
            null,
            2
          )
        }
      }
    },
    {
      name: "Get Payment Details",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId/payment",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId", "payment"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Update Payment Status",
      request: {
        method: "PATCH",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId/payment",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId", "payment"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              status: "Paid",
              method: "UPI",
              transactionId: "TXN-9876543210"
            },
            null,
            2
          )
        }
      }
    },
    {
      name: "Get Shipping Details",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId/shipping",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId", "shipping"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Update Shipping Details",
      request: {
        method: "PATCH",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId/shipping",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId", "shipping"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              courierName: "BlueDart Express",
              trackingNumber: "BD-987654321IN",
              dispatchDate: "2026-07-24T12:00:00.000Z",
              estimatedDeliveryDate: "2026-07-27T18:00:00.000Z",
              status: "Shipped"
            },
            null,
            2
          )
        }
      }
    },
    {
      name: "Generate Invoice Payload",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId/invoice",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId", "invoice"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    },
    {
      name: "Get Order Timeline",
      request: {
        method: "GET",
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: "{{baseUrl}}/api/admin/orders/:orderId/timeline",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "orders", ":orderId", "timeline"],
          variable: [{ key: "orderId", value: "ORDER_ID_OR_MONGO_ID" }]
        },
        auth: {
          type: "bearer",
          bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
        }
      }
    }
  ]
};

// Check if Inventory folder already exists
const invIndex = collection.item.findIndex(i => i.name === 'Inventory');
if (invIndex >= 0) {
  collection.item[invIndex] = inventoryFolder;
} else {
  collection.item.push(inventoryFolder);
}

// Check if Order Management folder already exists
const orderIndex = collection.item.findIndex(i => i.name.startsWith('Order Management'));
if (orderIndex >= 0) {
  collection.item[orderIndex] = orderFolder;
} else {
  collection.item.push(orderFolder);
}

fs.writeFileSync(postmanPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('Postman collection updated successfully with Order Management (Phase 1) folder and 13 endpoints!');
