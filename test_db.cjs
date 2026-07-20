const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testDB() {
  await mongoose.connect('mongodb://localhost:27017/tajwin'); // Adjust DB name if different
  
  // Find auth model dynamically since it's ESM
  const { User, Role } = await import('./src/modules/auth/model.js');
  
  const role = await Role.findOne({ name: 'ADMIN' });
  if (!role) {
    console.log('No ADMIN role found');
    process.exit(1);
  }

  const user = await User.findOne({ roleId: role._id });
  if (!user) {
    console.log('No admin user found. Creating one...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@tajwin.com',
      mobile: '9999999999',
      password: hashedPassword,
      roleId: role._id,
      isActive: true
    });
    console.log('Admin user created. Run test_profile.cjs again.');
  } else {
    console.log('Admin user exists. Email:', user.email);
  }
  process.exit(0);
}

testDB().catch(console.error);
