const fs = require('fs')
const mime = require('mime')
const Handlebars = require('handlebars')
const { parse } = require('url')
const { join, extname } = require('path')
const { promisify } = require('util')
const zlib = require('zlib')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const isFresh = require('./utils/cache')

const template = Handlebars.compile(fs.readFileSync(join(__dirname, './layout/dir.html')).toString())

module.exports = async (req, res, conf) => {
  try {
    const { pathname } = parse(req.url)
    const filepath = join(__dirname, '../public', pathname)
    const stats = await stat(filepath)
    
    if (stats.isFile()) {
      // 如果是文件
      const mineType = mime.getType(extname(filepath))
      res.statusCode = 200
      res.setHeader('Content-Type', mineType + ';charset=utf-8')
      if (isFresh(stats, req, res)) {
        // 存在缓存
        res.statusCode = 304
        res.end()
        return
      }
      // 创建可读流
      const rs = fs.createReadStream(filepath)
      // 是否需要压缩
      const encoding = req.headers['accept-encoding'].trim().split(',')
      if (conf.compressed.test(extname(filepath)) && encoding.length) {
        let compressType = ''
        let compress = null
        if (encoding.includes('gzip')) {
          // 优先gzip
          compressType = 'gzip'
          compress = zlib.createGzip()
        } else if (encoding.includes('deflate')) {
          // 其次deflate
          compressType = 'deflate'
          compress = zlib.createDeflate()
        } else {
          // 否则不压缩
        }
        res.setHeader('Content-Encoding', compressType)
        rs.pipe(compress).pipe(res)
      } else {
        rs.pipe(res)
      }
    } else if (stats.isDirectory()) {
      // 如果是文件夹
      const dirs = await readdir(filepath)
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html;charset=utf-8')
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
    console.error(err)
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/html')
    res.end('Not Found')
  }
}