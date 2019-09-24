const { getIPAdress } = require('../utils')

module.exports = {
  port: 2222,
  host: getIPAdress(),
  compressed: /\.(css|js|html)/,
  cache: {
    maxAge: 600,
    expires: true,
    cacheControl: true,
    lastModified: true,
    eTag: true
  }
}