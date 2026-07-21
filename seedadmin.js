import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dbConnect from './src/database/dbConnect.js';
import { Role, Permission, RolePermission, User } from '#modules/auth/model.js';
import { PERMISSIONS } from '#modules/auth/permissions.js';
import logger from '#config/logger.js';

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@tajwin.com';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';

async function seed() {
  logger.info('Connecting to database...');
  try {
    await dbConnect();
    logger.info('Connected to MongoDB successfully for seeding.');
  } catch (err) {
    logger.error('Database connection failed. Please ensure MongoDB is running.', err);
    process.exit(1);
  }

  try {
    // 1. Seed Roles
    logger.info('\n--- Seeding Roles ---');
    const rolesToSeed = [
      { name: 'ADMIN', description: 'Administrator with full control' },
      { name: 'DELSHIP', description: 'Delship user account' },
      { name: 'EMPLOYEE', description: 'Employee user account' },
      { name: 'DEALER', description: 'Dealer user account' },
      { name: 'CUSTOMER', description: 'Standard consumer account' },
    ];

    const rolesMap = {};
    for (const roleData of rolesToSeed) {
      let role = await Role.findOne({ name: roleData.name });
      if (!role) {
        role = await Role.create(roleData);
        logger.info(`+ Created Role: ${roleData.name}`);
      } else {
        logger.info(`* Role already exists: ${roleData.name}`);
      }
      rolesMap[roleData.name] = role;
    }

    // 2. Seed Permissions
    logger.info('\n--- Seeding Permissions ---');
    const permissionsMap = {};
    for (const [key, val] of Object.entries(PERMISSIONS)) {
      let permission = await Permission.findOne({ key: val });
      if (!permission) {
        permission = await Permission.create({
          key: val,
          description: `Permission to execute ${val} actions`,
        });
        logger.info(`+ Created Permission: ${val}`);
      } else {
        logger.info(`* Permission already exists: ${val}`);
      }
      permissionsMap[val] = permission;
    }

    // 3. Map Permissions to ADMIN Role
    logger.info('\n--- Mapping Permissions to ADMIN Role ---');
    const adminRole = rolesMap['ADMIN'];
    for (const permKey of Object.values(PERMISSIONS)) {
      const permObj = permissionsMap[permKey];
      const mappingExists = await RolePermission.findOne({
        roleId: adminRole._id,
        permissionId: permObj._id,
      });

      if (!mappingExists) {
        await RolePermission.create({
          roleId: adminRole._id,
          permissionId: permObj._id,
        });
        logger.info(`+ Mapped Permission ${permKey} -> ADMIN`);
      } else {
        logger.info(`* Mapping already exists: ${permKey} -> ADMIN`);
      }
    }

    // 4. Seed Admin User
    logger.info('\n--- Checking Admin Account ---');
    let adminUser = await User.findOne({ email: SEED_ADMIN_EMAIL, isDeleted: false });
    
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, salt);

      adminUser = await User.create({
        name: 'Administrator',
        email: SEED_ADMIN_EMAIL,
        password: hashedPassword,
        roleId: adminRole._id,
      });
      logger.info(`+ Created Admin User: ${SEED_ADMIN_EMAIL}`);
    } else {
      // Force update the role to ensure it is correctly mapped to ADMIN
      adminUser.roleId = adminRole._id;
      await adminUser.save();
      logger.info(`* Admin User already exists: ${SEED_ADMIN_EMAIL}. Role forcefully updated to ADMIN.`);
    }

    logger.info('\nSeeding completed successfully!');
  } catch (error) {
    logger.error('Error during seeding process:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('Disconnected from MongoDB.');
    }
    process.exit(0);
  }
}

seed();
