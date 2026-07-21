import mongoose from 'mongoose';
import dns from 'dns';
import logger from '#config/logger.js';
import { config } from '#config/env.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Favor IPv4
      maxPoolSize: 10,
    };

    // Connection events
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Safely hide credentials in logs
    const safeUri = config.mongoUri.includes('@') 
      ? config.mongoUri.split('@')[1] 
      : config.mongoUri;

    logger.info(`Initiating MongoDB connection to: ${safeUri} (credentials hidden)`);
    
    cached.promise = mongoose.connect(config.mongoUri, opts)
      .then(mongooseInstance => mongooseInstance)
      .catch(async (e) => {
        logger.error(`MongoDB initial connection failed: ${e.message}`);
        
        // Detect SRV DNS failure
        if (e.message.includes('querySrv ECONNREFUSED') && config.mongoUri.startsWith('mongodb+srv://')) {
          logger.warn('Detected querySrv ECONNREFUSED error. This is usually due to Node.js / OS IPv6 DNS conflicts.');
          logger.info('Switching Node.js DNS servers to Google DNS (8.8.8.8, 8.8.4.4) for fallback resolution...');
          
          try {
            // Apply Google DNS to the Node.js process globally to bypass ISP/Local DNS SRV blocking
            dns.setServers(['8.8.8.8', '8.8.4.4']);
            logger.info('Retrying MongoDB connection...');
            
            // Retry connection
            return await mongoose.connect(config.mongoUri, opts);
          } catch (fallbackError) {
            logger.error(`Fallback connection also failed: ${fallbackError.message}`);
            throw fallbackError;
          }
        }
        
        throw e;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // reset promise so next call can retry
    logger.error(`CRITICAL: Could not connect to MongoDB.`);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
