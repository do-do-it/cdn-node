const http = require('http')
const conf = require('./config')
const route = require('./route')
if (process.env.name) conf.host = '127.0.0.1'

const app = http.createServer((req, res) => {
  route(req, res, conf)
})

app.listen(conf.port, conf.host, () => {
  const url = `http://${conf.host}:${conf.port}`
  console.log(`server started at ${url}`)
})