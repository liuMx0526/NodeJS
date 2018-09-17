// 文件 readStream.txt 内容为 1234567890
let fs = require("fs")
let ReadStream = require("./MyReadStream")

// 创建可读流
// let rs = new ReadStream("./readStream.txt", {
let rs = fs.createReadStream("./readStream.txt", {
    encoding: 'utf8',
    start: 0,
    end: 5,
    highWaterMark: 2
})

rs.on("open", () => console.log("open"))

rs.on("data", data => {
    console.log(data, new Date())
    rs.pause()
    setTimeout(() => rs.resume(), 1000)
})

rs.on("end", () => console.log("end"))
rs.on("close", () => console.log("close"))
rs.on("error", err => console.log(err))



// open
// 12 2018-09-16T10:44:20.384Z
// 34 2018-09-16T10:44:21.384Z
// 56 2018-09-16T10:44:22.384Z
// end
// close