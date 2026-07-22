import 'dotenv/config';
import mongoose from 'mongoose';
import dbConnect from '../src/database/dbConnect.js';
import InventoryService from '../src/modules/admin/inventory/service/inventory.service.js';
import Inventory, { calculateInventoryStatus } from '../src/modules/admin/inventory/model/inventory.model.js';

async function runVerification() {
  console.log('=== STARTING INVENTORY MODULE VERIFICATION ===');
  
  await dbConnect();
  console.log('Connected to Database');

  const dummyAdminId = new mongoose.Types.ObjectId();
  const testSku1 = `TEST-SKU-IN STOCK-${Date.now()}`;
  const testSku2 = `TEST-SKU-LOW-${Date.now()}`;
  const testSku3 = `TEST-SKU-OUT-${Date.now()}`;

  let item1, item2, item3;

  try {
    // 1. Create In Stock item (availableStock: 20)
    console.log('\n--- 1. Testing Add Inventory (In Stock) ---');
    item1 = await InventoryService.createInventory(
      {
        productName: 'ThinkPad X1 Carbon',
        brand: 'Lenovo',
        model: 'X1 Carbon Gen 9',
        category: 'Laptops',
        sku: testSku1,
        serialNumber: 'SN-THINK-001',
        totalStockQuantity: 25,
        availableStock: 20,
        remarks: 'Test Item In Stock',
      },
      dummyAdminId
    );
    console.log(`Created Item 1 ID: ${item1._id}, SKU: ${item1.sku}, Status: ${item1.status}`);
    if (item1.status !== 'In Stock') throw new Error(`Expected 'In Stock', got '${item1.status}'`);

    // 2. Create Low Stock item (availableStock: 3)
    console.log('\n--- 2. Testing Add Inventory (Low Stock) ---');
    item2 = await InventoryService.createInventory(
      {
        productName: 'MacBook Pro 14',
        brand: 'Apple',
        model: 'M1 Pro 2021',
        category: 'Laptops',
        sku: testSku2,
        serialNumber: 'SN-APPLE-002',
        totalStockQuantity: 5,
        availableStock: 3,
        remarks: 'Test Item Low Stock',
      },
      dummyAdminId
    );
    console.log(`Created Item 2 ID: ${item2._id}, SKU: ${item2.sku}, Status: ${item2.status}`);
    if (item2.status !== 'Low Stock') throw new Error(`Expected 'Low Stock', got '${item2.status}'`);

    // 3. Create Out of Stock item (availableStock: 0)
    console.log('\n--- 3. Testing Add Inventory (Out of Stock) ---');
    item3 = await InventoryService.createInventory(
      {
        productName: 'HP EliteBook 840',
        brand: 'HP',
        model: 'G8',
        category: 'Laptops',
        sku: testSku3,
        serialNumber: 'SN-HP-003',
        totalStockQuantity: 0,
        availableStock: 0,
        remarks: 'Test Item Out of Stock',
      },
      dummyAdminId
    );
    console.log(`Created Item 3 ID: ${item3._id}, SKU: ${item3.sku}, Status: ${item3.status}`);
    if (item3.status !== 'Out of Stock') throw new Error(`Expected 'Out of Stock', got '${item3.status}'`);

    // 4. Test Duplicate SKU Prevention
    console.log('\n--- 4. Testing Duplicate SKU Prevention ---');
    try {
      await InventoryService.createInventory(
        {
          productName: 'Duplicate SKU Item',
          brand: 'Lenovo',
          category: 'Laptops',
          sku: testSku1,
        },
        dummyAdminId
      );
      throw new Error('FAILED: Duplicate SKU should have thrown an error!');
    } catch (err) {
      console.log(`Successfully caught expected duplicate SKU error: "${err.message}"`);
    }

    // 5. Test Stock Underflow & Negative Stock Prevention
    console.log('\n--- 5. Testing Stock Underflow Prevention ---');
    try {
      await InventoryService.decreaseStock(item2._id, 10, dummyAdminId);
      throw new Error('FAILED: Decrease stock beyond available stock should have failed!');
    } catch (err) {
      console.log(`Successfully caught expected stock underflow error: "${err.message}"`);
    }

    // 6. Test Stock Increase
    console.log('\n--- 6. Testing Increase Stock ---');
    const updatedItem3 = await InventoryService.increaseStock(item3._id, 4, dummyAdminId);
    console.log(`Increased item 3 stock by 4 -> Available: ${updatedItem3.availableStock}, New Status: ${updatedItem3.status}`);
    if (updatedItem3.availableStock !== 4 || updatedItem3.status !== 'Low Stock') {
      throw new Error('Increase stock test failed status/quantity verification!');
    }

    // 7. Test Stock Decrease
    console.log('\n--- 7. Testing Decrease Stock ---');
    const decreasedItem1 = await InventoryService.decreaseStock(item1._id, 18, dummyAdminId);
    console.log(`Decreased item 1 stock by 18 -> Available: ${decreasedItem1.availableStock}, New Status: ${decreasedItem1.status}`);
    if (decreasedItem1.availableStock !== 2 || decreasedItem1.status !== 'Low Stock') {
      throw new Error('Decrease stock test failed status/quantity verification!');
    }

    // 8. Test Direct Stock Update
    console.log('\n--- 8. Testing Direct Stock Update ---');
    const directItem1 = await InventoryService.updateStockDirectly(item1._id, { availableStock: 0, totalStockQuantity: 10 }, dummyAdminId);
    console.log(`Directly set stock to 0 -> Available: ${directItem1.availableStock}, Total: ${directItem1.totalStockQuantity}, New Status: ${directItem1.status}`);
    if (directItem1.status !== 'Out of Stock') {
      throw new Error('Direct stock update status verification failed!');
    }

    // 9. Test Query Filters & Search
    console.log('\n--- 9. Testing Listing & Filtering ---');
    const allList = await InventoryService.getAllInventory({ search: 'ThinkPad' });
    console.log(`Search result for 'ThinkPad': found ${allList.inventory.length} item(s)`);

    const lowStockList = await InventoryService.getLowStock({});
    console.log(`Low Stock List count: ${lowStockList.inventory.length}`);

    const outOfStockList = await InventoryService.getOutOfStock({});
    console.log(`Out of Stock List count: ${outOfStockList.inventory.length}`);

    // 10. Test Soft Delete
    console.log('\n--- 10. Testing Soft Delete ---');
    await InventoryService.deleteInventory(item1._id);
    try {
      await InventoryService.getInventoryById(item1._id);
      throw new Error('FAILED: Soft-deleted item should not be found!');
    } catch (err) {
      console.log(`Successfully caught expected 404 for deleted item: "${err.message}"`);
    }

    console.log('\n=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! ===');
  } finally {
    // Cleanup created test records if any exist
    if (item1?._id) await Inventory.deleteOne({ _id: item1._id });
    if (item2?._id) await Inventory.deleteOne({ _id: item2._id });
    if (item3?._id) await Inventory.deleteOne({ _id: item3._id });
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

runVerification().catch((err) => {
  console.error('VERIFICATION FAILED WITH ERROR:', err);
  process.exit(1);
});
