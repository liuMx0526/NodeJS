// 引入依赖模块
let EventEmmitter = require('events');
let fs = require('fs');

class ReadStream extends EventEmitter {
  constructor(path, options = {}) {
    super();
    // 创建可读流参数传入的属性
    this.path = path; // 读取文件的路径
    this.flags = options.flags || "r"; // 文件标识位
    this.encoding = options.encoding || null; // 字符编码
    this.fd = options.fd || null; // 文件描述符
    this.mode = options.mode || 0o666; // 权限位
    this.autoClose = options.autoClose || true; // 是否自动关闭
    this.start = options.start || 0; // 读取文件的起始位置
    this.end = options.end || null; // 读取文件的结束位置（包含）
    this.highWaterMark = options.highWaterMark || 64 * 1024; // 每次读取文件的字节数

    this.flowing = false; // 控制当前是否是流动状态，默认为暂停状态
    this.pos = this.start; // 下次读取文件的位置（变化的）

    // 创建可读流要打开文件
    this.open();

    // 如果监听了 data 事件，切换为流动状态
    this.on("newListener", type => {
      if (type === "data") {
        this.flowing = true;
        // 开始读取文件
        this.read();
      }
    });
  }
  // 关闭文件
  destroy() {
    // 判断文件描述符是否为数字
    if (typeof this.fd != 'number') {
      // 不存在文件描述符直接触发 close 事件
      this.emit('close');
    } else {
      // 存在则关闭文件并触发 close 事件
      fs.close(this.fd, () => {
        this.emit('close');
      })
    }
  }
  // open 方法的实现
  open() {
    // fd文件描述符 只要文件打开了就是number
    fs.open(this.path, this.flags, (err, fd) => {
      if (err) { // 销毁文件
        if (this.autoClose) { // 如果需要自动关闭 触发一下销毁事件
          this.destroy(); // 我想用它销毁文件
        }
        return this.emit('error', err);
      }
      this.fd = fd;
      this.emit('open', fd);
    });
  };
  read() {
    if (typeof this.fd !== 'number') {
      // 没有的话 要等待系统触发open事件后再次读取 此时保证一定是有的
      return this.once('open', () => this.read());
    }
    // 把数据读取到这个buffer中
    let buffer = Buffer.alloc(this.highWaterMark);
    //如果指定了start和end呢？ 0-3
    // 根据end 来读取而不是每次都是highWaterMark
    let howMuchToRead = Math.min(this.end - this.pos + 1, this.highWaterMark);
    fs.read(this.fd, buffer, 0, howMuchToRead, this.pos, (err, byteRead) => {
      // buffer就是读取到的内容
      if (byteRead > 0) { // 如过读取到内容后 就继续读取
        this.emit('data', buffer.slice(0, byteRead));
        this.pos += byteRead;
        if (this.flowing) {
          this.read();
        }
      } else {
        this.flowing = null;
        this.emit('end');
        if (this.autoClose) {
          this.destroy();
        }
      }
    });
  }
  pause() {
    this.flowing = false;
  }
  resume() {
    this.flowing = true;
    this.read();
  }
  pipe(ws) {
    this.on('data', (data) => {
      let flag = ws.write(data);
      if (!flag) {
        this.pause();
      }
    });
    ws.on('drain', () => {
      this.resume();
    })
  }
}

module.exports = ReadStream;