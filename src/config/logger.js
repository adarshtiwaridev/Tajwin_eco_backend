import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom log format for console (developer friendly)
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Configure the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // ensure stack traces are captured
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json() // default output in JSON for production/aggregators
  ),
  defaultMeta: { service: 'tajwin-backend' },
  transports: [
    // In production, you might add file transports or external services (e.g. Datadog, AWS CloudWatch)
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production, add a console transport with a simpler, colorized format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: combine(
        timestamp(),
        json()
      ),
    })
  );
}

export default logger;
