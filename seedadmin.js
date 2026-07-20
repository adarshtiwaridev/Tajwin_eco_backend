import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role, Permission, RolePermission, User } from './modules/auth/model.js';
import { PERMISSIONS } from './modules/auth/permissions.js';

// Parse .env manually for standalone script execution
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    const index = trimmedLine.indexOf('=');
    if (index !== -1) {
      const key = trimmedLine.substring(0, index).trim();
      let val = trimmedLine.substring(index + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@tajwin.com';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';

async function seed() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');
  } catch (err) {
    console.error('Database connection failed. Please ensure MongoDB is running.', err);
    process.exit(1);
  }

  try {
    // 1. Seed Roles
    console.log('\n--- Seeding Roles ---');
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
        console.log(`+ Created Role: ${roleData.name}`);
      } else {
        console.log(`* Role already exists: ${roleData.name}`);
      }
      rolesMap[roleData.name] = role;
    }

    // 2. Seed Permissions
    console.log('\n--- Seeding Permissions ---');
    const permissionsMap = {};
    for (const [key, val] of Object.entries(PERMISSIONS)) {
      let permission = await Permission.findOne({ key: val });
      if (!permission) {
        permission = await Permission.create({
          key: val,
          description: `Permission to execute ${val} actions`,
        });
        console.log(`+ Created Permission: ${val}`);
      } else {
        console.log(`* Permission already exists: ${val}`);
      }
      permissionsMap[val] = permission;
    }

    // 3. Map Permissions to ADMIN Role
    console.log('\n--- Mapping Permissions to ADMIN Role ---');
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
        console.log(`+ Mapped Permission ${permKey} -> ADMIN`);
      } else {
        console.log(`* Mapping already exists: ${permKey} -> ADMIN`);
      }
    }

    // 4. Seed Admin User
    console.log('\n--- Checking Admin Account ---');
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
      console.log(`+ Created Admin User: ${SEED_ADMIN_EMAIL}`);
    } else {
      // Force update the role to ensure it is correctly mapped to ADMIN
      adminUser.roleId = adminRole._id;
      await adminUser.save();
      console.log(`* Admin User already exists: ${SEED_ADMIN_EMAIL}. Role forcefully updated to ADMIN.`);
    }

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();

