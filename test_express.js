import express from 'express';
import v1Routes from './src/routes/v1/index.js';
import request from 'http'; // we can just use supertest if available, else plain http

const app = express();
app.use(express.json());
app.use('/api/v1', v1Routes);

// Simple mock error handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Not Found - ' + req.originalUrl });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

const server = app.listen(5002, () => {
  console.log('Server started on 5002');
  
  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/v1/auth/profile',
    method: 'GET'
  };

  const req = request.request(options, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('PROFILE RESPONSE:', res.statusCode, body);
      server.close();
    });
  });
  req.end();
});
