/**
 * Created by samhwang1990@gmail.com on 17/3/10.
 */

'use strict';

/*
* process.cpuUsage([previous cpuUsage])
*
* 用于计算程序当前的cpu 占用时间，包括代码运行在user space、kernel space 时的占用时间
* 也可通过传入previous cpuUsage 参数，计算相差的user space、kernel space 运行占用时间
*
* 下面的例子中，
* 1. while 循环整整占用了500ms 的cpu 运行时间，这段时间几乎都用在user space 上；
* 2. setTimeout 虽然设置了500ms 的延迟，但由于timer 函数其实是异步IO，IO 在运行时cpu 一般处于idle 状态
*    所以，此时user space、kernel space 的占用时间都非常短
*
* 参考文章：[Understanding Linux CPU stats](http://blog.scoutapp.com/articles/2015/02/24/understanding-linuxs-cpu-stats)
* */
function cpuUsage() {
  console.log('process.cpuUsage() test case');
  console.log(`process id: ${process.pid}`);
  let cpuUsage1 = process.cpuUsage();
  let now = Date.now();
  while (Date.now() - now < 500);
  console.log(`cpu usage in spin cpu 500ms: ${JSON.stringify(process.cpuUsage(cpuUsage1))}`);

  let cpuUsage2 = process.cpuUsage();
  setTimeout(() => {
    console.log(`cpu usage in 500ms timeout: ${JSON.stringify(process.cpuUsage(cpuUsage2))}`);
  }, 500);
}

/*
* process.hrtime([previous hrtime])
*
* 返回一个高精确度的时间数组来表示计算程序进程当前的运行时长
* 也可通过传入previous hrtime 参数来计算当前hrtime 与previous hrtime 之间的时长，返回同样结构的高精确度时间数组
*
* 数组有两个元素组成：[seconds, nanoseconds]
* 该数组的计算过程大致是：
* 1. 假设有process._hrtime() 来计算进程运行时长，返回结果的单位是：纳秒
* 2. 将上面单位为纳秒的整数除以 1e9，商为数组的第一个元素seconds，余数为数组的第二个元素nanoseconds
*
* 比如，下面的例子中有个2秒的timeout，而在timeout 的回调中计算了下timeout 前后的时长，
* 返回的结果中，seconds 为2，nanoseconds 中的数值必然小于1e9
*
* 思考一下为什么要以这个数组形式返回，而不是直接返回纳秒呢？
* ------ 我是自己思考的分割线 ------
* 在Javascript 中，Number 类型的值存储空间是64bit，而针对integer 类型，更是只有小于54bit 的整数才能保证数值的精度
*
* ES6 提供了一个常量来输出最大支持的integer 数值：Number.MAX_SAFE_INTEGER = 9007199254740991
* 同时提供了一个方法来判断某个数值是否是安全的，可保证精度的integer 数值：Number.isSafeInteger()
*
* 了解了背景知识后，我们再来看上面的思考问题。
* 假设process.hrtime() 返回的结果直接是nanoseconds，则在确保精度的情况下，可以支持的最大纳秒数是：9007199254740991
* 这个数值转换为日期的话，大概是多久呢：9007199254740991 / 1e9 / 60 / 60 / 24 / 30 = 3.474999712477234
* 也就是只能精确到三个半月左右，这对于一个稳定长期运行的程序来说，简直毛都不算。
*
* 显然，适当的拆分下运行时长的返回结构，可以保证这个方法的结果的高精确度：不仅仅是时间的精确度，更是数值本身的精确度
*
* 另外也可以思考下，现在process.hrtime() 的拆分结构是否合适，比如，类似以下的结构会不会更好呢：
* [days, nanoseconds]、[months, nanoseconds]、[milliseconds, nanoseconds]
*
* 哈哈，其实我觉得现在的拆分结构确实挺好的～～～
*
*
* ------ 我是乱入的分割线 ------
* 上文有提到一个很重要的概念，process.hrtime() 返回的结果在时间上是高精确度的，为什么这么说呢？这里的"高"，又是和谁来比较的呢？
*
* 在平时测量一段程序的运行时间，我们一般都会这样写：
* ```javascript
* let now = Date.now();
* // do some thing
* let after = Date.now();
* let interval = after - now;
* ```
*
* 上面的计时逻辑很简单，就是计算运行前和运行后的时间之差，单位精确到** 毫秒 **
* 很明显，传统的计时逻辑的瓶颈在于单位的精确度。
* 而使用process.hrtime()，计时逻辑的精确度提高到了纳秒，之间差了6 个数量级。
*
* 下面的例子清晰看到，
* startSyncDate 与endSyncDate 间的间隔只精确到毫秒，在很短的一段逻辑中，得到的间隔数值就会是0，
* 而intervalSyncHrtime，在很短的一段逻辑中，也能显示出运行时间
*
* 参考文章：[How to Measure Execution Time in Node.js](https://blog.tompawlak.org/measure-execution-time-nodejs-javascript)
*
* */
function hrtime() {
  console.log('process.hrtime() test case');

  let startSyncDate = Date.now();
  let endSyncDate = Date.now();
  console.log(`date time elapse in sync: ${endSyncDate - startSyncDate}ms`);

  let startSyncHrtime = process.hrtime();
  let intervalSyncHrtime = process.hrtime(startSyncHrtime);
  console.log(`date time elapse in sync: ${intervalSyncHrtime[0] * 1e9 + intervalSyncHrtime[1]} nanoseconds`);

  let startTimerHrtime = process.hrtime();
  setTimeout(() => {
    let intervalTimerHrtime = process.hrtime(startTimerHrtime);
    console.log(`interval timer hrtime: ${intervalTimerHrtime[0]} seconds and ${intervalTimerHrtime[1]} nanoseconds`);
    console.log(`date time elapse in async timer: ${intervalTimerHrtime[0] * 1e9 + intervalTimerHrtime[1]} nanoseconds`);
  }, 2000);
}

/*
* process.memoryUsage()
*
* 返回进程的内存使用情况，包括：常驻集的大小 - rss、堆的总值 - heapTotal、实际使用的堆 - heapUsed
*
* 这些数值实际上是v8 引擎返回的。
*
* 关于进程内存使用，涉及到v8 的内存分配机制、垃圾回收机制、内存泄漏等知识点，暂时还没能力潜得太深，就先贴几个链接：
* - [深入理解Node.js中的垃圾回收和内存泄漏的捕获](http://wwsun.github.io/posts/understanding-nodejs-gc.html)
* - [node-memwatch](https://github.com/lloyd/node-memwatch)
* - [V8 之旅： 垃圾回收器](http://newhtml.net/v8-garbage-collection/)
*
* todo: 过段时间，深入了解下各种容易造成内存泄漏的写法
*
* */
function memoryUsage() {
  console.log('process.memoryUsage() test case');

  let usage = process.memoryUsage();
  console.log(`rss: ${usage.rss}, heapTotal: ${usage.heapTotal}, heapUsed: ${usage.heapUsed}, external: ${usage.external}`);
}

/*
* process.uptime()
*
* 简单的返回进程运行的时长，单位是s
* */
function uptime() {
  console.log(`process had been running ${process.uptime()}`);
  let now = Date.now();
  while (Date.now() - now < 5000) {}

  console.log(`process had been running ${process.uptime()}`);

  setTimeout(() => {
    console.log(`process had been running ${process.uptime()}`);
  }, 2000);
}

module.exports = {
  cpuUsage,
  hrtime,
  memoryUsage,
  uptime
};