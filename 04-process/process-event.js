/**
 * Created by samhwang1990@gmail.com on 17/3/9.
 */

'use strict';

/*
* beforeExit 事件
* 触发时机：当前Node.js 进程中的事件循环队列为空时触发
*
* 使用场景：在进程真正exit 之前做些清理工作，比如文件描述符、流的关闭等
*
* 值得注意：
* 1. beforeExit 回调函数中是允许使用异步逻辑的，但这段逻辑会被放到事件循环队列中执行，
*    意味着event loop 又被延长了，而当异步处理完后，event loop 又被清空，此时beforeExit 又会触发，如此循环，
*    所以，不注意使用异步逻辑的前值条件，很容易造成进程无法退出
* */
function beforeExitEvent() {
  let timeBeforeExit = 0;

  process.on('beforeExit', (exitCode) => {
    console.log(`sync beforeExit with exitCode: ${exitCode}`);

    process.nextTick(() => {
      console.log('nextTick beforeExit');
    });

    timeBeforeExit < 2 && setTimeout(() => {
      ++timeBeforeExit;
      console.log(`async beforeExit called ${timeBeforeExit} times`);
    }, 10);
  });
}

/*
* exit 事件
* 触发时机：
* 1. event loop 队列为空
* 2. 显式执行process.exit()
*
* 值得注意：
* 当event 事件的回调结束后，process 会马上关闭，所以：
* 1. 不要在回调中使用异步逻辑，因为没有用
* 2. process.nextTick 中的逻辑也是不会执行的
* */
function exitEvent() {
  process.on('exit', (exitCode) => {
    console.log(`sync exit with exitCode: ${exitCode}`);

    process.nextTick(() => {
      console.log('nextTick exit');
    });

    setTimeout(() => {
      console.log(`async exit`);
    }, 10);
  });

  setTimeout(() => {
    process.exitCode = 3;
    console.log('no more to do');
  }, 100)
}

function uncaughtExceptionEvent() {
  process.on('exit', code => {
    console.log(`process exit with code: ${code}`);
  });

  process.on('uncaughtException', err => {
    console.log('uncaughtException: ');
    console.log(`name: ${err.name}`);
    console.log(`message: ${err.message}`);
    console.log(`stack: ${err.stack}`);
  });

  setTimeout(() => {
    throw new Error('throw error in settimeout');
  }, 10);

  throw new Error('throw error in sync loop');
}

function rejectionRelativeEvent() {
  let rejectionMap = new Map();

  process.on('beforeExit', code => {
    console.log(`before exit: ${code}`);
    rejectionMap.clear();
  });

  process.on('rejectionHandled', promise => {
    console.log(`rejectionHandled caught: ${promise}`);
    rejectionMap.delete(promise);
  });

  process.on('unhandledRejection', (promise, error) => {
    console.log(`unhandledRejection caught: ${error}`);
    rejectionMap.set(promise, error);
  });

  let p1 = new Promise((resolve, reject) => {
    reject('throw in promise 1');
  });

  setTimeout(() => {
    p1.catch(msg => {
      console.log(`handle rejection: ${msg}`);
    })
  }, 2000);
}

rejectionRelativeEvent();