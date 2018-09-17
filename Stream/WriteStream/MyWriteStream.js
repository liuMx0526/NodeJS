// 引入依赖模块
let fs = require("fs")
let EventEmitter = require("events")

// 创建 WriteStream 类
class WriteStream extends EventEmitter {
  constructor(path, options = {}) {
    super()
    // 创建可写流参数传入的属性
    this.path = path // 写入文件的路径
    this.flags = options.flags || "w" // 文件标识位
    this.encoding = options.encoding || "utf8" // 字符编码
    this.fd = options.fd || null // 文件描述符
    this.mode = options.mode || 0o666 // 权限位
    this.autoClose = options.autoClose || true // 是否自动关闭
    this.start = options.start || 0 // 写入文件的起始位置
    this.highWaterMark = options.highWaterMark || 16 * 1024 // 对比写入字节数的标识

    this.writing = false // 是否正在写入
    this.needDrain = false // 是否需要触发 drain 事件
    this.buffer = [] // 缓存，正在写入就存入缓存中
    this.len = 0 // 当前缓存的个数
    this.pos = this.start // 下次写入文件的位置（变化的）

    // 创建可写流要打开文件
    this.open()
  }

  // 打开文件
  open() {
    fs.open(this.path, this.flags, this.mode, (err, fd) => {
      if (err) {
        this.emit("error", err)
        if (this.autoClose) {
          this.destroy()
          return
        }
      }
      this.fd = fd
      this.emit("open")
    })
  }

  // 关闭文件
  detroy() {
    if (typeof this.fd === "number") {
      fs.close(fd, () => {
        this.emit("close")
      })
      return
    }
    this.emit("close")
  }

  // 写入文件的方法，只要逻辑为写入前的处理
  write(chunk, encoding = this.encoding, callback) {
    // 为了方便操作将要写入的数据转换成 Buffer
    chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)

    // 维护缓存的长度
    this.len += chunk.lenth

    // 否触发 drain 事件的标识
    this.needDrain = this.highWaterMark <= this.len

    // 如果正在写入
    if (this.writing) {
      this.cache.push({ chunk, encoding, callback})
    } else {
      // 更改标识为正在写入，再次写入的时候走缓存
      this.writing = true
      // 如果已经写入清空缓存区的内容
      this._write(chunk, encoding, () => this.clearBuffer())
    }
    return !this.needDrain
  }

}

// 导出模块
module.exports = WriteStream
