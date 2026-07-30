import { BaseRepository } from '#core/repository.js';
import Inventory from '../model/inventory.model.js';
import Warehouse from '../model/warehouse.model.js';
import StockAllocation from '../model/stockAllocation.model.js';
import InventoryMovement from '../model/inventoryMovement.model.js';
import EndUserDelivery from '../model/endUserDelivery.model.js';
import { ActivityLog, Notification } from '../model/activityLog.model.js';

class InventoryRepository extends BaseRepository {
  constructor() {
    super(Inventory);
    this.WarehouseModel = Warehouse;
    this.StockAllocationModel = StockAllocation;
    this.MovementModel = InventoryMovement;
    this.DeliveryModel = EndUserDelivery;
    this.ActivityLogModel = ActivityLog;
    this.NotificationModel = Notification;
  }

  async findBySku(sku) {
    if (!sku) return null;
    return this.model.findOne({
      sku: sku.toUpperCase().trim(),
      deletedAt: null,
    });
  }

  async findBySerialNumber(serialNumber) {
    if (!serialNumber) return null;
    return this.model.findOne({
      serialNumber: serialNumber.trim(),
      deletedAt: null,
    });
  }

  getLowStockQuery() {
    return this.model.find({
      status: 'Low Stock',
      deletedAt: null,
    });
  }

  getOutOfStockQuery() {
    return this.model.find({
      status: 'Out of Stock',
      deletedAt: null,
    });
  }

  async createMovement(movementData) {
    const movementId = 'MOV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    return await this.MovementModel.create({
      movementId,
      ...movementData,
    });
  }

  async createActivityLog(action, performedBy, details = {}, targetId = null) {
    return await this.ActivityLogModel.create({
      action,
      performedBy,
      details,
      targetId,
    });
  }

  async createNotification(notificationData) {
    return await this.NotificationModel.create(notificationData);
  }
}

export default new InventoryRepository();
