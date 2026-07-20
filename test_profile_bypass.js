import jwt from 'jsonwebtoken';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Role } from './src/modules/auth/model.js';

dotenv.config();

async function run() {
  await mongoose.connect('mongodb://localhost:27017/tajwin');
  const role = await Role.findOne({ name: 'ADMIN' });
  const user = await User.findOne({ roleId: role._id });

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, role: 'ADMIN' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
  
  console.log('Generated token:', token);
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/profile',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('PROFILE RESPONSE:', res.statusCode, body);
      process.exit(0);
    });
  });
  req.end();
}

run().catch(console.error);
