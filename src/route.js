const fs = require('fs')
const mime = require('mime')
const Handlebars = require("handlebars")
const { parse } = require('url')
const { join, extname } = require('path')
const { promisify } = require('util')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)

const template = Handlebars.compile(fs.readFileSync(join(__dirname, './layout/dir.html')).toString())

module.exports = async (req, res) => {
  try {
    const { pathname } = parse(req.url)
    const filepath = join(__dirname, '../public', pathname)
    const file = await stat(filepath)
    if (file.isFile()) {
      // 如果是文件
      const mineType = mime.getType(extname(filepath))
      res.statusCode = 200
      res.setHeader('Content-Type', mineType)
      fs.createReadStream(filepath).pipe(res)
    } else if (file.isDirectory()) {
      // 如果是文件夹
      const dirs = await readdir(filepath)
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      const data = []
      dirs.forEach(file => {
        data.push({
          name: file,
          url: pathname === '/' ? pathname + file : pathname + '/' + file
        })
      })
      
      res.end(template({
        title: pathname === '/' ? 'root' : pathname,
        data
      }))
    } else {
      res.statusCode = 200
      res.end('Not a File or Directory')
    }

  } catch (err) {
    console.log(err)
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/html')
    res.end('Not Found')
  }
}