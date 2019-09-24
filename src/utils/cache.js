const { cache } = require('../config/index')

function generateETag(stat) {
  const mtime = stat.mtime.getTime().toString(16)
  const size = stat.size.toString(16)
  return `W/"${size}-${mtime}"`
}

/**
 * 设置缓存信息
 * @param {Object} stats 文件
 * @param {Object} res 响应内容 
 */
function refreshRes(stats, res) {

  const { maxAge, expires, cacheControl, lastModified, eTag } = cache

  if (expires) {
    res.setHeader('Expires', (new Date(Date.now() + maxAge * 1000)).toUTCString())
  }

  if (cacheControl) {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`)
  }

  if (lastModified) {
    res.setHeader('Last-Modified', stats.mtime.toUTCString())
  }

  if (eTag) {
    res.setHeader('ETag', generateETag(stats))
  }
}

/**
 * 判断缓存是否失效
 * @param {Object} stats 文件
 * @param {Object} req 请求
 * @param {Object} res 响应
 */
function isFresh(stats, req, res) {
  // 初始化
  refreshRes(stats, res)

  const lastModified = req.headers['if-modified-since']
  const eTag = req.headers['if-none-match']

  if (!lastModified && !eTag) {
    // 第一次请求
    return false
  }

  if (lastModified && lastModified !== res.getHeader('Last-Modified')) {
    // 不一样 失效
    return false
  }

  if (eTag && eTag !== res.getHeader('ETag')) {
    return false
  }

  return true
}

module.exports = isFresh