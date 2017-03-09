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

/*
* uncaughtException 事件
* 触发时机：进程中出现抛异常，而该异常没有被捕抓到
*
* Node.JS 官方建议，当process 遇到uncaughtException 事件时，应该退出进程，
* 而不是尝试忽略掉并让进程继续运行，从而避免后面的逻辑产生更多未知的错误。（错误严重程度可大可小）
* 建议是直接退出进程，并让进程管理程序（比如PM2）控制是否重启程序
*
* */
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

/*
* unhandledRejection 事件
* 触发时机：
* 1. promise 运行时调用了reject，相当于出错了；
* 2. 若发生reject 时，promise 没有任何catch 回调来处理rejection，则触发unhandledRejection 事件；
*
* rejectionHandled 事件
* 触发时机：
* promise 添加catch 回调来处理rejection，
* 1. 若promise 已经是rejected 状态，且未被处理过，即，该promise 未发过rejectionHandled 事件，则触发rejectionHandled 事件
* 2. 若promise 已经是rejected 状态，且已经有catch 回调处理过了，则不会触发rejectionHandled 事件
* 3. 若promise 处于非rejected 状态，则不会触发rejectionHandled 事件
*
* 简单理解：如果一个promise 转换到rejected 状态时触发了unhandledRejection 事件，
* 在unhandledRejection 事件触发后**第一次**添加catch 回调则会触发rejectionHandled 事件。
*
*
* 在做了简单的测试后，发现，promise 的resolve、reject 的调用是其实是在process.nextTick 才将结果输出。
*
* 参考下面的p1、p2、p3、p4
* p1:
*   reject 是同步调用的，意味着，在process.nextTick() 之后，该promise 就会处于rejected 状态
*   在一个异步timer 中，p1 添加了一个rejection catch 回调，
*   即，p1 从pending 转换到rejected 时并没有catch 回调，于是触发了unhandledRejection 事件，
*   而当异步timer 完成添加rejection catch 回调后，就会触发rejectionHandled 事件。
*
* p2:
*   p2 根本没有catch 回调来处理rejection，所以必然触发unhandledRejection 事件，
*   而，因为没有添加任何catch 回调，也就不会触发rejectionHandled 事件。
*
* p3:
*   reject 是在异步timer 中调用的，而在同个事件循环中以同步方式添加了一个rejection catch 回调，
*   即，p3 从pending 转换到rejected 时已经有catch 回调，于是不会触发unhandledRejection 事件，自然也不会触发rejectionHandled 事件
*
* p4:
*   reject 是同步调用的，意味着，在process.nextTick() 之后，该promise 就会处于rejected 状态，
*   在同个事件循环中以同步方式添加了一个rejection catch 回调，
*   即，p4 从pending 转换到rejected 时（process.nextTick）已经有catch 回调，于是不会触发unhandledRejection 事件，
*   因为不需要触发unhandledRejection 事件，自然也不会触发rejectionHandled 事件
*
* */
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

  let p2 = new Promise((resolve, reject) => {
    reject('throw in promise 2');
  });

  let p3 = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('throw in promise 3');
    }, 1000);
  });

  p3.catch(msg => {
    console.log(`handle rejection: ${msg}`);
  });

  let p4 = new Promise((resolve, reject) => {
    reject('throw in promise 4');
  });

  p4.catch(msg => {
    console.log(`handle rejection: ${msg}`);
  });
}

rejectionRelativeEvent();