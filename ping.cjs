const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/profile',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('RESPONSE:', res.statusCode, body);
  });
});

req.end();
