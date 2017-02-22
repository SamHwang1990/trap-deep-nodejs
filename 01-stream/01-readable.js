/**
 * Created by samhwang1990@gmail.com on 17/2/22.
 */

/**
 * Readable Stream 是一个内容生产者
 * 内部有一个类似状态机的机制，结合内容的生成逻辑，来控制如何向流的消费者推送数据、何时推送以及推送哪些数据。
 *
 * 因还没看过实现源码，目前只是根据行为总结规律而已：
 *
 * 状态机由以下几个组成：
 * - ended {Boolean} 当stream 到达end 时，就不会再产生新内容到buffer 了；
 * - buffer {Buffer | Object | Null} 缓存stream 已产生的，但未被消费的内容；
 * - flowing {Null|Boolean} stream 是否处于flowing mode，当值为null 时，stream 是不会产生内容的；
 * - reading {Boolean} 判断stream 是否正在产生新内容，当stream._read() 被调用时设为true，stream.push() 被调用时设为false
 *
 * Readable Stream 中重要的几个方法：
 * - _read()，基类ReadableStream 上的一个delegate，每个子类都需要实现该方法，产生内容的入口方法
 * - push()，将新内容以参数形式传入方法中调用，则可能触发两种行为：写入buffer 缓存（paused mode）、直接随data 事件发送（flowing mode）
 *      无论是哪种行为，下一步，都会触发下一次的stream._read() 来尝试产生新的内容
 * - read()，两种mode 有不同的调用方式和调用意义：
 *      - paused mode：该模式下建议是外部调用，即实例化stream 的人通过调用stream.read() 来从状态机的buffer 中获取数据
 *      - flowing mode：该模式一般不需要外部调用，内部在发送完data 事件之后就会调用stream.read() 来尝试产生新内容
 *
 * 下面粗略介绍下Readable Stream 的两个模式，包括模式间的切换、模式下消费内容的方式和注意事项。
 *
 * 一般来说，Readable Stream 提供两种消耗内容的调用方式：
 * 1. 监听readable 事件，并主动调用read() 方法拉取数据
 * 2. 监听data 事件，当有新内容产生时，回调就会被触发
 *
 * 第一种调用方式称为paused mode，即状态机中的flowing 为false
 * 第二种调用方式称为flowing mode，即状态机中的flowing 为true
 *
 * paused mode 注意事项：
 * 0. 大前提：若stream 处于flowing mode，readable 是不会触发的，read() 也没有数据返回
 * 1. 当dataCache 从空变为非空时，会触发readable 事件
 * 2. read(size) 支持从dataCache 中拉取给定size 字节的数据，不传递size 参数则表示拉取所有数据，若cache 为空，则返回null
 *
 * flowing mode 注意事项：
 * 0. stream 内部通过调用push() 来完成新内容的生成，并将内容放到dataCache 中；
 * 1. data 事件的绑定起始时发生在nextTick 的，即下一个事件循环的开始；
 * 2. 绑定的data 事件能实时接受新生成的内容；
 *
 * 模式切换：paused mode <=> flowing mode
 * Readable Stream 创建后默认处于paused mode
 *
 * paused mode => flowing mode
 * - 添加data 事件监听（Adding a 'data' event handler.）
 * - 调用stream.resume() 方法（Calling the stream.resume() method.）
 * - 调用stream.pipe() ，使用一个Writable Stream 来消费内容（Calling the stream.pipe() method to send the data to a Writable.）
 *
 * flowing mode => paused mode
 * - 当stream 没有连到任何writable stream 消费内容，则调用stream.pause() 即可完成转换；
 *    （If there are no pipe destinations, by calling the stream.pause() method.）
 * - 当stream 有使用pipe() 连到writable stream 消费内容，则需要调用unpipe() 取消连接然后调用stream.pause() 才能完成转换；
 *    （If there are pipe destinations, by removing any 'data' event handlers, and removing all pipe destinations by calling the stream.unpipe() method.）
 * */

'use strict';

const stream = require('stream');

class ReadStream extends stream.Readable {
  constructor() {
    super();
    this.count = 1;
  }

  _read(size) {
    let self = this;
    if (this.count < 10) {
      ++this.count;
      setTimeout(() => {
        self.push(self.count.toString());
      }, 1000);
    } else {
      this.push(null);
    }
  }
}

(function simpleFlowingStream() {
  let flowReadStream = new ReadStream();
  flowReadStream.on('data', buf => {
    console.log(`flow read stream on data with toString: ${buf.toString()}`);
  });
  flowReadStream.on('end', () => {
    console.log(`flow read stream reach to end`);
  });
});

(function simplePausedStream() {
  let blockReadStream = new ReadStream();
  blockReadStream.on('readable', () => {
    console.log('block read stream is readable');
    setTimeout(() => {
      console.log(blockReadStream.read().toString());
    }, 2000);
  });
});