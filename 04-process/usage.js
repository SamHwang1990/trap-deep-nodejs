/**
 * Created by samhwang1990@gmail.com on 17/3/10.
 */

'use strict';

/*
* process.cpuUsage([previous cpuUsage])
*
* 用户计算程序当前的cpu 占用时间，包括代码运行在user space、kernel space 时的占用时间
* 也可通过传入previous cpuUsage 参数，计算相差的user space、kernel space 运行占用时间
*
*
* */
function cpuUsage() {
  console.log('process.cpuUsage() test case');
  let cpuUsage1 = process.cpuUsage();
  let now = Date.now();
  while (Date.now() - now < 500);
  console.log(`cpu usage in spin cpu 500ms: ${JSON.stringify(process.cpuUsage(cpuUsage1))}`);

  let cpuUsage2 = process.cpuUsage();
  setTimeout(() => {
    console.log(`cpu usage in 500ms timeout: ${JSON.stringify(process.cpuUsage(cpuUsage2))}`);
  }, 500);
}

cpuUsage();