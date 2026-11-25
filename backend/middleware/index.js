// middleware/index.js
module.exports = {
  protect: require('./auth').protect,
  admin: require('./admin').admin,
  errorHandler: require('./errorHandler'),
};
