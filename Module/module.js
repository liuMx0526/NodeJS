//操作文件的模块
let fs = require('fs')
// 处理路径的模块
let path = require('path')
// 虚拟机模块，沙箱运行，防止变量污染
let vm = require('vm')

// 创建module构造函数
function Module(id) {
  this.id = id;
  this.exports = {}
}

// 根据绝对路径进行缓存的模块对象
Module._cacheModule = {};

// 存放闭包字符串
Module.wrapper = [
  "(function (exports, require, module, __filename, __dirname) {",
  "})"
]

// 将我们读到js的内容传入,组合成闭包字符串
Module.wrap = function (script) {
  return Module.wrapper[0] + script + Module.wrapper[1];
}

// 处理对应后缀名模块
Module._extensions = {
  ".js": function (module) {
    // 对于js文件，读取内容
    let content = fs.readFileSync(module.id, 'utf8')
    // 给内容添加闭包, 后面实现
    let funcStr = Module.wrap(content)
    // vm沙箱运行, node内置模块，前面我们已经引入， 将我们js函数执行，将this指向 module.exports
    vm.runInThisContext(funcStr).call(module.exports, module.exports, req, module)
  },
  ".json": function (module) {
    // 对于json文件的处理就相对简单了，将读取出来的字符串转换未JSON对象就可以了
    module.exports = JSON.parse(fs.readFileSync(module.id, 'utf8'))
  }
}

// 将引入文件处理为绝对路径
Module._resolveFilename = function (p) {
  // 以js或者json结尾的
  if ((/\.js$|\.json$/).test(p)) {
    // __dirname当前文件所在的文件夹的绝对路径
    // path.resolve方法就是帮我们解析出一个绝对路径出来
    return path.resolve(__dirname, p);
  } else {
    // 没有后后缀  自动拼后缀 
    // Module._extensions 处理不同后缀的模块
    let exts = Object.keys(Module._extensions);
    let realPath; // 存放真实存在文件的绝对路径
    for (let i = 0; i < exts.length; i++) {
      // 依次匹配对应扩展名的绝对路径
      let temp = path.resolve(__dirname, p + exts[i])
      try {
        // 通过fs的accessSync方法对路径进行查找，找不到对应文件直接报错 
        fs.accessSync(temp)
        realPath = temp
        break
      } catch (e) {
      }
    }
    if (!realPath) {
      throw new Error('module not exists');
    }
    // 将存在绝对路径返回
    return realPath
  }
}

// 根据传入的模块，尝试加载模块方法
function tryModuleLoad(module) {
  // 前面我们已经提到 module.id 为模块的识别符，通常是带有绝对路径的模块文件名
  // path.extname 获取文件的扩展名
  /* let ext = path.extname(module.id);
  // 如果扩展名是js 调用js处理器 如果是json 调用json处理器
  Module._extensions[ext](module); // exports 上就有了数组 */
  let ext = path.extname(module.id);//扩展名
  // 如果扩展名是js 调用js处理器 如果是json 调用json处理器
  Module._extensions[ext](module); // exports 上就有了数组
}

// 模块加载
Module._load = function (f) {
  // 相对路径,可能这个文件没有后缀，尝试加后缀
  let fileName = Module._resolveFilename(f); // 获取到绝对路径
  // 判断缓存中是否有该模块
  if (Module._cacheModule[fileName]) {
    return Module._cacheModule[fileName].exports
  }
  let module = new Module(fileName); // 没有就创建模块
  Module._cacheModule[fileName] = module // 并将创建的模块添加到缓存

  // 加载模块
  tryModuleLoad(module)
  return module.exports
}

// 测试代码
function req(p) {
  return Module._load(p); // 加载模块
}

let str = req('./1.NodeJS');
let str1 = req('./1.NodeJS.js');
console.log(str) // first NodeJS
console.log(str1) // first NodeJS