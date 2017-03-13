/**
 * Created by samhwang1990@gmail.com on 17/3/14.
 */

'use strict';

/*
* process.nextTick()
*
* 在下一事件队列之前添加callback 调用
*
* 这里需要弄清process.nextTick() 与setTimeout(cb, 0) 之间的调用顺序：
* setTimeout 的cb 是在timeout 已达到，且事件队列为空时才执行回调
* 而process.nextTick() 则一定程度上是延长了事件队列，
* 所以，调用顺序是：process.nextTick() 早于setTimeout(cb, 0)
*
* */

process.nextTick(name => {
  console.log(`next tick invoke with ${name}`)
}, 'sam');

setTimeout(() => {
  console.log(`timeout invoke`);
}, 0);

console.log(`sync exec`);