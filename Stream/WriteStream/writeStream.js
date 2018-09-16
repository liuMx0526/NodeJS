// 引入依赖
let fs = require('fs')
let ws = fs.createWriteStream('./writeStream.txt', {
  start: 0, // 开始写入位置，默认0
})
ws.on('open', () => {
  console.log('open');
});
let flag = ws.write('1')
ws.on('drain', () => {
  console.log('drain')
})
ws.end('写完了')
ws.on('finish', () => {
  console.log('所有写入已完成。');
});
ws.on('close', () => {
  console.error('close');
});
