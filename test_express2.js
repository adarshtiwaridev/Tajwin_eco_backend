import express from 'express';
import v1Routes from './src/routes/v1/index.js';
import request from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User, Role } from './src/modules/auth/model.js';

const app = express();
app.use(express.json());
app.use('/api/v1', v1Routes);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Not Found - ' + req.originalUrl });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

async function run() {
  await mongoose.connect('mongodb://localhost:27017/tajwin');
  const role = await Role.findOne({ name: 'ADMIN' });
  let user = await User.findOne({ roleId: role._id });
  if (!user) {
    console.log('No user found');
    process.exit(1);
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, role: 'ADMIN' },
    'secret',
    { expiresIn: '1h' }
  );

  const server = app.listen(5003, () => {
    console.log('Server started on 5003');
    
    const options = {
      hostname: 'localhost',
      port: 5003,
      path: '/api/v1/auth/profile',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    const req = request.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        console.log('PROFILE RESPONSE:', res.statusCode, body);
        server.close();
        process.exit(0);
      });
    });
    req.end();
  });
}

run().catch(console.error);
