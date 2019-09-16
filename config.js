module.exports = {
  PORT: process.env.PORT || 3000,
  API_TOKEN: `Bearer ${process.env.BEARERTOKEN0}`,
  DATABASE_URL: 'mongodb://127.0.0.1:27017/cr_api',
};
