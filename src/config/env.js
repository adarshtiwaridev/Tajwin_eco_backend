export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tajwin',
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'secret123',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh123',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  }
};
