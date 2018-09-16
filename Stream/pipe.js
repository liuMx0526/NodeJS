/** 读写混合使用  */
// 引入fs模块
const fs = require("fs");

// 创建可读流和可写流
let rs = fs.createReadStream("./ReadStream/readStream.txt", {
    highWaterMark: 3
});
let ws = fs.createWriteStream("./writeStream.txt", {
    highWaterMark: 2
});

// 将 readStream.txt 的内容通过流写入 writeStream.txt 中
rs.pipe(ws);