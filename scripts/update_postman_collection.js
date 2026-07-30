import fs from 'fs';
import path from 'path';

const collection = {
  info: {
    name: 'Tajwin Backend API Collection (Audited Baseline)',
    description: 'Audited and verified Postman collection containing strictly implemented backend endpoints in Tajwin.',
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
        {
          name: 'Refresh Token',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/auth/refresh', host: ['{{baseUrl}}'], path: ['api', 'v1', 'auth', 'refresh'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
            body: { mode: 'raw', raw: '{}' }
          }
        },
        {
          name: 'Get Profile',
          request: {
            method: 'GET',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/auth/profile', host: ['{{baseUrl}}'], path: ['api', 'v1', 'auth', 'profile'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] }
          }
        },
        {
          name: 'Update Profile',
          request: {
            method: 'PUT',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/auth/profile', host: ['{{baseUrl}}'], path: ['api', 'v1', 'auth', 'profile'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
            body: { mode: 'raw', raw: JSON.stringify({ name: 'Admin User', mobile: '9876543210' }, null, 2) }
          }
        },
        {
          name: 'Change Password',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/auth/change-password', host: ['{{baseUrl}}'], path: ['api', 'v1', 'auth', 'change-password'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
            body: { mode: 'raw', raw: JSON.stringify({ currentPassword: 'oldPassword', newPassword: 'newPassword123!' }, null, 2) }
          }
        },
        {
          name: 'Logout',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/auth/logout', host: ['{{baseUrl}}'], path: ['api', 'v1', 'auth', 'logout'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] }
          }
        }
      ]
    },
    {
      name: 'Inventory Management',
      item: [
        {
          name: 'Create Inventory',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/admin/inventory', host: ['{{baseUrl}}'], path: ['api', 'v1', 'admin', 'inventory'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                productName: 'Dell Latitude 5420 Refurbished',
                brand: 'Dell',
                model: 'Latitude 5420',
                category: 'Laptops',
                sku: 'DELL-LAT-5420-001',
                serialNumber: 'SN-987654321',
                totalStockQuantity: 15,
                availableStock: 15,
                remarks: 'Grade A Condition'
              }, null, 2)
            }
          }
        },
        {
          name: 'Get All Inventory',
          request: {
            method: 'GET',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: {
              raw: '{{baseUrl}}/api/v1/admin/inventory?page=1&limit=10&brand=Dell&category=Laptops&status=In Stock&sort=-createdAt',
              host: ['{{baseUrl}}'],
              path: ['api', 'v1', 'admin', 'inventory'],
              query: [
                { key: 'page', value: '1' },
                { key: 'limit', value: '10' },
                { key: 'brand', value: 'Dell' },
                { key: 'category', value: 'Laptops' },
                { key: 'status', value: 'In Stock' },
                { key: 'sort', value: '-createdAt' }
              ]
            },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] }
          }
        },
        {
          name: 'Get Low Stock Items',
          request: {
            method: 'GET',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: {
              raw: '{{baseUrl}}/api/v1/admin/inventory/low-stock?page=1&limit=10',
              host: ['{{baseUrl}}'],
              path: ['api', 'v1', 'admin', 'inventory', 'low-stock'],
              query: [
                { key: 'page', value: '1' },
                { key: 'limit', value: '10' }
              ]
            },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] }
          }
        },
        {
          name: 'Get Out of Stock Items',
          request: {
            method: 'GET',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: {
              raw: '{{baseUrl}}/api/v1/admin/inventory/out-of-stock?page=1&limit=10',
              host: ['{{baseUrl}}'],
              path: ['api', 'v1', 'admin', 'inventory', 'out-of-stock'],
              query: [
                { key: 'page', value: '1' },
                { key: 'limit', value: '10' }
              ]
            },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] }
          }
        },
        {
          name: 'Get Inventory Item by ID',
          request: {
            method: 'GET',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/admin/inventory/:inventoryId', host: ['{{baseUrl}}'], path: ['api', 'v1', 'admin', 'inventory', ':inventoryId'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] }
          }
        },
        {
          name: 'Update Inventory',
          request: {
            method: 'PUT',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/admin/inventory/:inventoryId', host: ['{{baseUrl}}'], path: ['api', 'v1', 'admin', 'inventory', ':inventoryId'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                productName: 'Dell Latitude 5420 Refurbished (Updated)',
                totalStockQuantity: 20,
                availableStock: 18,
                remarks: 'Updated stock details'
              }, null, 2)
            }
          }
        },
        {
          name: 'Delete Inventory',
          request: {
            method: 'DELETE',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/admin/inventory/:inventoryId', host: ['{{baseUrl}}'], path: ['api', 'v1', 'admin', 'inventory', ':inventoryId'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] }
          }
        },
        {
          name: 'Increase Stock',
          request: {
            method: 'PATCH',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/admin/inventory/:inventoryId/increase-stock', host: ['{{baseUrl}}'], path: ['api', 'v1', 'admin', 'inventory', ':inventoryId', 'increase-stock'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
            body: {
              mode: 'raw',
              raw: JSON.stringify({ amount: 5 }, null, 2)
            }
          }
        },
        {
          name: 'Decrease Stock',
          request: {
            method: 'PATCH',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/admin/inventory/:inventoryId/decrease-stock', host: ['{{baseUrl}}'], path: ['api', 'v1', 'admin', 'inventory', ':inventoryId', 'decrease-stock'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
            body: {
              mode: 'raw',
              raw: JSON.stringify({ amount: 2 }, null, 2)
            }
          }
        },
        {
          name: 'Direct Stock Update',
          request: {
            method: 'PATCH',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/v1/admin/inventory/:inventoryId/update-stock', host: ['{{baseUrl}}'], path: ['api', 'v1', 'admin', 'inventory', ':inventoryId', 'update-stock'] },
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
            body: {
              mode: 'raw',
              raw: JSON.stringify({ totalStockQuantity: 25, availableStock: 20 }, null, 2)
            }
          }
        }
      ]
    }
  ]
};

const targetPath = path.join(process.cwd(), 'tajwin-postman-collection.json');
fs.writeFileSync(targetPath, JSON.stringify(collection, null, 2));
console.log('Audited and updated tajwin-postman-collection.json cleanly.');
