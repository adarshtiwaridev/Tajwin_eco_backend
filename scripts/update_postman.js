import fs from 'fs';
import path from 'path';

const postmanPath = path.resolve('tajwin-postman-collection.json');
const collection = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

// Update collection name & description
collection.info.name = "Tajwin - Admin API Collection (Auth, Products & Inventory)";
collection.info.description = "Complete collection containing Auth, Product Management, and Inventory Management (Phase 1) endpoints with pre-filled test payloads.";

const inventoryFolder = {
  name: "Inventory",
  item: [
    {
      name: "Add Inventory",
      request: {
        method: "POST",
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory"]
        },
        auth: {
          type: "bearer",
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
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
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
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
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
        }
      }
    },
    {
      name: "Get Low Stock Items",
      request: {
        method: "GET",
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
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
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
        }
      }
    },
    {
      name: "Get Out of Stock Items",
      request: {
        method: "GET",
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
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
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
        }
      }
    },
    {
      name: "Get Inventory by ID",
      request: {
        method: "GET",
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId"],
          variable: [
            {
              key: "inventoryId",
              value: "INVENTORY_ID_HERE"
            }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
        }
      }
    },
    {
      name: "Update Inventory",
      request: {
        method: "PUT",
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId"],
          variable: [
            {
              key: "inventoryId",
              value: "INVENTORY_ID_HERE"
            }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
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
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId"],
          variable: [
            {
              key: "inventoryId",
              value: "INVENTORY_ID_HERE"
            }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
        }
      }
    },
    {
      name: "Increase Stock",
      request: {
        method: "PATCH",
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId/increase-stock",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId", "increase-stock"],
          variable: [
            {
              key: "inventoryId",
              value: "INVENTORY_ID_HERE"
            }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
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
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId/decrease-stock",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId", "decrease-stock"],
          variable: [
            {
              key: "inventoryId",
              value: "INVENTORY_ID_HERE"
            }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
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
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        url: {
          raw: "{{baseUrl}}/api/admin/inventory/:inventoryId/update-stock",
          host: ["{{baseUrl}}"],
          path: ["api", "admin", "inventory", ":inventoryId", "update-stock"],
          variable: [
            {
              key: "inventoryId",
              value: "INVENTORY_ID_HERE"
            }
          ]
        },
        auth: {
          type: "bearer",
          bearer: [
            {
              key: "token",
              value: "{{accessToken}}",
              type: "string"
            }
          ]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify({ totalStockQuantity: 25, availableStock: 20 }, null, 2)
        }
      }
    }
  ]
};

// Check if Inventory folder already exists
const existingIndex = collection.item.findIndex(i => i.name === 'Inventory');
if (existingIndex >= 0) {
  collection.item[existingIndex] = inventoryFolder;
} else {
  collection.item.push(inventoryFolder);
}

fs.writeFileSync(postmanPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('Postman collection updated successfully with Inventory folder and 10 endpoints!');
