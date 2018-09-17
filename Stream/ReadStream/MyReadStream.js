// 引入依赖模块
let fs = require('fs')
let EventEmitter = require('events')

// 创建 ReadStream 类 并继承 EventEmitter
class ReadStream extends EventEmitter {
  constructor(path, options = {}) {
    super()
    // 创建可读流参数传入的属性
    this.path = path // 读取文件的路径
    this.flags = options.flags || "r" // 文件标识位
    this.encoding = options.encoding || null // 字符编码
    this.fd = options.fd || null // 文件描述符
    this.mode = options.mode || 0o666 // 权限位
    this.autoClose = options.autoClose || true // 是否自动关闭
    this.start = options.start || 0 // 读取文件的起始位置
    this.end = options.end || null // 读取文件的结束位置（包含）
    this.highWaterMark = options.highWaterMark || 64 * 1024 // 每次读取文件的字节数

    this.flowing = false // 控制当前是否是流动状态，默认为暂停状态
    this.pos = this.start // 下次读取文件的位置（变化的）

    // 创建可读流要打开文件
    this.open()

    // 如果监听了 data 事件，切换为流动状态
    this.on("newListener", type => {
      if (type === "data") {
        this.flowing = true

        // 开始读取文件
        this.read()
      }
    })
  }

  // 打开文件
  open() {
    fs.open(this.path, this.flags, this.mode, (err, fd) => {
      if (err) {
        this.emit("error", err)
        // 如果文件打开了出错，并配置自动关闭，则关掉文件
        if (this.autoClose) {
          // 关闭文件（触发 close 事件）
          this.destroy()
        }
      }
      // 存储文件描述符
      this.fd = fd
      // 成功打开文件后触发 open 事件
      this.emit("open", fd)
    })
  }

  // 关闭文件
  destroy() {
    // 判断文件描述符是否为数字
    if (typeof this.fd != 'number') {
      // 不存在文件描述符直接触发 close 事件
      this.emit('close')
    } else {
      // 存在则关闭文件并触发 close 事件
      fs.close(this.fd, () => {
        this.emit('close')
      })
    }
  }

  // 读取文件
  read() {
    // 由于 open 异步执行，read 是在创建实例时同步执行
    // read 执行可能早于 open，此时不存在文件描述符
    if (typeof this.fd !== "number") {
      // 因为 open 用 emit 触发了 open 事件，所以在这是重新执行 read
      return this.once("open", () => this.read())
    }
    // 把数据读取到这个buffer中
    let buffer = Buffer.alloc(this.highWaterMark)

    // 如过设置了结束位置，读到结束为止
    // 有可能最后一次读取真实读取数应该小于 highWaterMark
    // 所以每次读取的字节数应该和 highWaterMark 取最小值
    let howMuchToRead = Math.min(this.end - this.pos + 1, this.highWaterMark)

    // 读取文件
    fs.read(this.fd, buffer, 0, howMuchToRead, this.pos, (err, byteRead) => {
      // buffer就是读取到的内容
      if (byteRead > 0) { // 如过读取到内容后 就继续读取
        // 触发 data 事件,并根据字符编码传递数据
        if (this.encoding === 'utf8')
          this.emit('data', buffer.slice(0, byteRead).toString())
        else
          this.emit('data', buffer.slice(0, byteRead))
        // 维护下次读取文件位置
        this.pos += byteRead
        // 递归读取
        if (this.flowing) {
          this.read()
        }
      } else {
        this.flowing = null
        this.emit('end')
        if (this.autoClose) {
          this.destroy()
        }
      }
    })
  }

  // 暂停读取
  pause() {
    this.flowing = false
  }

  // 恢复读取
  resume() {
    this.flowing = true
    if (!this.isEnd) this.read()
  }

}

// 导出模块
module.exports = ReadStream
