// 引入依赖
let fs = require('fs')
let rs = fs.createReadStream('./readStream.txt', {
  flags: 'r', // 标识读取文件
  encoding: 'utf-8', // 字符编码, 默认为null
  autoClose: false, // 读取后自动关闭，默认为true
  // start: 0, // 开始读取位置，默认0
  end: 30, // 结束位置，默认文章读取完
  highWaterMark: 3, // 最多读取， 每次读取的个数 默认：64*1024 字节
})
// 事件机制，需要自己去监听一些数据

// open 文件打开
rs.on('open', () => {
  console.log('文件开启了')
})
// 结果：文件开启了

// 默认不流动，非流动模式，需要监听data时间，内容会按照highWaterMark 读取数据，把读取到的内容返回回来
rs.on('data', (data) => {
  console.log(data)
})

/** 结果：文件开启了
 *<Buffer 31 32 33>
 * <Buffer 34>
 */

// end 文件读取结束  如果参数end设置了值(end: 3)就读取 0-3 就自动调用end事件结束
rs.on('end', () => {
  console.log('结束了')
})

/** 设置了end: 3的运行结果
 * 文件开启了
 * <Buffer 31 32 33>
 * <Buffer 34>
 * 结束了
 */

/** 没有设置end参数的运行结果 
 * 文件开启了
 * <Buffer 31 32 33>
 * <Buffer 34 35 36>
 * <Buffer 37 38 39>
 * <Buffer 30>
 * 结束了
 */

// error事件 出错时自动调用
rs.on('error', (err) => {
  console.log(err)
})

// 读取完成自动关闭， 如果参数autoClose: false 文件就不会close
rs.on('close', () => {
  console.log('close')
})