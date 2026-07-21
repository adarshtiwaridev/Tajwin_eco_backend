import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/env.js';
import dbConnect from './database/dbConnect.js';
import logger from '#config/logger.js';

let server;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await dbConnect();
    logger.info('Database connection established. Starting server...');

    // 2. Start Express Server
    server = app.listen(config.port, () => {
      logger.info(`Server is running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unexpected closures
const exitHandler = async () => {
  if (server) {
    server.close(async () => {
      logger.info('Express server closed');
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
      }
      process.exit(1);
    });
  } else {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
    }
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(`Unexpected error: ${error.message}`, { stack: error.stack });
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, initiating graceful shutdown');
  if (server) {
    server.close(async () => {
      logger.info('Express server closed');
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, initiating graceful shutdown');
  if (server) {
    server.close(async () => {
      logger.info('Express server closed');
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
