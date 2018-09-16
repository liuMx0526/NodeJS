// 引入依赖
let fs = require('fs')
let rs = fs.createReadStream('./readStream.txt', {
  encoding: 'utf-8', // 字符编码, 默认为null
  highWaterMark: 2
})
let i = 0

rs.on('data', (data) => {
  i ++
  console.log(`第 ${i} 次`, new Date())
  console.log(data)
  rs.pause() // 暂停
  setTimeout(() => {
    rs.resume() // 恢复
  }, 1000)
})
rs.on('end', () => {
  console.log('结束了')
})