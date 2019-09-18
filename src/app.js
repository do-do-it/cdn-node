const http = require('http')
const conf = require('./config')
const route = require('./route')

const app = http.createServer((req, res) => {
  route(req, res)
})

app.listen(conf.port, conf.host, () => {
  console.log(`server started at http://${conf.host}:${conf.port}`)
})