/**
 * Created by samhwang1990@gmail.com on 17/2/28.
 */

'use strict';

const Stream = require('stream');

class TransformStream extends Stream.Transform {
  constructor(...args) {
    super(...args);
  }
  _transform(chunk, encoding, cb) {
    setTimeout(() => {
      cb(null, Buffer.concat([chunk, chunk]));
    }, 1000);
  }
}

let simpleTStream = new TransformStream();
simpleTStream.on('data', chunk => {
  console.log(`simple transform stream received chunk ${chunk.toString()}`);
});

let tsWriteCount = 5;
while (tsWriteCount > 0) {
  simpleTStream.write(tsWriteCount + '', (count => {
    return () => { console.log(`${new Date}: ${TransformStream.name} write ${count} successfully.`) };
  })(tsWriteCount));
  --tsWriteCount;
}