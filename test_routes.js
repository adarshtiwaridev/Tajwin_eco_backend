import express from 'express';
import v1Routes from './src/routes/v1/index.js';

const app = express();
app.use('/api/v1', v1Routes);

function printRoutes(route, basePath = '') {
  if (route.route) {
    console.log(`${Object.keys(route.route.methods).join(', ').toUpperCase()} ${basePath}${route.route.path}`);
  } else if (route.name === 'router' && route.handle.stack) {
    route.handle.stack.forEach(handler => {
      let nextPath = basePath;
      if (route.regexp && route.regexp.source !== '^\\/?$') {
        // Just extract the path manually since it's hard to parse regex
      }
      printRoutes(handler, basePath + (route.path || ''));
    });
  }
}

app._router.stack.forEach(layer => printRoutes(layer, ''));

console.log('Routes loaded without crash.');
