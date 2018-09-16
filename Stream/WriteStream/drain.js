
let fs = require('fs');
let ws = fs.createWriteStream('writeStream.txt', {
  flags: 'w',
  encoding: 'utf8',
  mode: 0o666,
  autoClose: true,
  start: 0,
  highWaterMark: 5 
});
// 我想写10个数 ，每次写三个，我希望只用三个字节的内存
let i = 0;
function write() {
  let flag = true
  while (i < 10 && flag) {
    flag = ws.write(i+++'','utf8');
  }
}
write(); // 如果写入的内容到达缓存区的大小了，当他写入完成后会触发一个事件
ws.on('drain',function () {
  console.log('占满');
  write(); // 缓存清空后 继续写入
})