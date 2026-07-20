const http = require('http');

const data = JSON.stringify({ email: 'admin@tajwin.com', password: 'admin123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('LOGIN RESPONSE:', res.statusCode, body);
    try {
      const parsed = JSON.parse(body);
      if (parsed.data && parsed.data.accessToken) {
        testProfile(parsed.data.accessToken);
      }
    } catch(e) {}
  });
});

req.write(data);
req.end();

function testProfile(token) {
  const req2 = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/profile',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }, (res2) => {
    let body = '';
    res2.on('data', d => body += d);
    res2.on('end', () => {
      console.log('PROFILE RESPONSE:', res2.statusCode, body);
    });
  });
  req2.end();
}
