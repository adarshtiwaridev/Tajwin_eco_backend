const getNormalizedMongoUri = () => {
  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tajwin';
  if (uri.startsWith('mongodb+srv://') && uri.endsWith('mongodb.net/')) {
    uri += 'tajwin?retryWrites=true&w=majority&appName=TajwinCluster';
  }
  return uri;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: getNormalizedMongoUri(),
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'secret123',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh123',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  }
};
