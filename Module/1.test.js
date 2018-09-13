// 我们自己写的文件模块 要写路径 ./ 或者../
let hello = require('./1.NodeJS')
console.log(hello) // first NodeJS


// 查看module都有哪些属性
console.log(module)


// 引入内置模块，直接模块名即可
let fs = require('fs') // 操作文件的模块