const { getIPAdress } = require('../utils')

module.exports = {
  port: 2222,
  host: getIPAdress()
}