import app from './app.js';
import { config } from './config/env.js';
import dbConnect from './database/dbConnect.js';

let server;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await dbConnect();

    // 2. Start Express Server
    server = app.listen(config.port, () => {
      console.log(`info: Server is running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    console.error('error: Failed to start server', error);
    process.exit(1);
  }
};

startServer();

// Handle unexpected closures
const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('info: Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.error('error: Unexpected error', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('info: SIGTERM received');
  if (server) {
    server.close();
  }
});
