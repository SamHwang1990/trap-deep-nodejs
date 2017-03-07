/**
 * Created by samhwang1990@gmail.com on 17/2/22.
 */

'use strict';

const stream = require('stream');

class AsyncReadStream extends stream.Readable {
  constructor(...args) {
    super(...args);
    this.count = 0;
  }

  _read(size) {
    let self = this;
    this.count += size;

    if (this.count < 30) {
      setTimeout(() => {
        self.push(self.count.toString());
      }, 1000);
    } else {
      this.push(null);
    }
  }
}

class SyncReadStream extends stream.Readable {
  constructor(...args) {
    super(...args);
    this.count = 0;
  }

  _read(size) {
    this.count += size;

    if (this.count < 30) {
      this.push(this.count.toString());
    } else {
      this.push(null);
    }
  }
}

function simplePauseAsyncRS() {

  let asyncRS = new AsyncReadStream();

  asyncRS.on('readable', () => {
    let chunks = asyncRS.read();
    if (chunks == null) {
      console.log('read to end');
    } else {
      console.log(chunks.toString());
    }
  });

  asyncRS.on('end', () => {
    console.log('stream ended and all data was consumed.')
  });
}

function simplePauseSyncRS() {
  let syncRS = new SyncReadStream({ highWaterMark: 6 });

  syncRS.push('prepush');

  // try to read more highWaterMark length data to buffer
  console.log(syncRS.read().toString());
  console.log(syncRS.read().toString());
  console.log(syncRS.read().toString());
  console.log(syncRS.read().toString());
}

function simpleFlowAsyncRS() {
  let asyncRS = new AsyncReadStream({ highWaterMark: 6 });

  asyncRS.on('data', chunk => {
    console.log(`on data received ${chunk.toString()}`);
  });

  asyncRS.on('readable', () => {
    console.log('sync rs readable event received.');
  });

  asyncRS.push('prepush');
  asyncRS.push('prepush1');
  asyncRS.push('prepush2');

  // although resume is trigger on nextTick, but before read() return, data event was emit first
  console.log(asyncRS.read().toString());
}

function simpleFlowSyncRS() {
  let syncRS = new SyncReadStream({ highWaterMark: 6 });

  syncRS.on('data', chunk => {
    console.log(`on data received ${chunk.toString()}`);
  });

  syncRS.on('readable', () => {
    console.log('sync rs readable event received.');
  });

  syncRS.push('prepush');
  syncRS.push('prepush1');
  syncRS.push('prepush2');

  // although resume is trigger on nextTick, but before read() return, data event was emit first
  console.log(syncRS.read().toString());
}

module.exports = {
  simpleFlowAsyncRS,
  simpleFlowSyncRS,
  simplePauseAsyncRS,
  simplePauseSyncRS
};