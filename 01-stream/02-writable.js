/**
 * Created by samhwang1990@gmail.com on 17/2/23.
 */

'use strict';

const Stream = require('stream');
const assert = require('assert');

class SingleWriteStream extends Stream.Writable {
  constructor(...args) {
    super(...args);
  }
  _write(chunk, encoding, cb) {
    console.log(`single write stream received chunk: ${chunk}`);

    // 故意写成异步
    setTimeout(() => {
      cb();
    }, 1000);
  }
}

class ConcatWriteStream extends Stream.Writable {
  constructor(...args) {
    super(...args);
  }
  _writev(chunks, cb) {
    console.log(`concat write stream receive ${chunks.length} chunks from bufferedRequest, and list below: `);
    for (let entry of chunks) {
      console.log(entry.chunk.toString());
    }
    console.log('\n');

    setTimeout(() => {
      cb();
    }, 2000);
  }

  _write(chunk, encoding, cb) {
    console.log(`concat write stream received chunk: ${chunk.toString()}`);

    setTimeout(() => {
      cb();
    }, 1000);
  }
}

function commonWSTestCase(ws, wsName = ws.constructor.name) {

  ws.on('finish', () => {
    console.log(`${wsName} received finish event`);
  });

  let wsWriteCount = 5;
  while (wsWriteCount > 0) {
    let writeRet = ws.write(wsWriteCount + '', (count => {
      return () => { console.log(`${new Date}: ${wsName} write ${count} successfully.`) };
    })(wsWriteCount));

    if (!writeRet) {
      console.log(`${wsName} wrote too many buffers, max limit is ${ws._writableState.highWaterMark}.`)
    }
    --wsWriteCount;
  }
}

function simpleSingleWriteStream() {
  let simpleWS = new SingleWriteStream;
  commonWSTestCase(simpleWS, simpleSingleWriteStream.name);
  simpleWS.end();
}

function simpleConcatWriteStream() {
  let simpleCWS = new ConcatWriteStream;
  commonWSTestCase(simpleCWS, simpleConcatWriteStream.name);
  simpleCWS.end();
}

function corkSingleWriteStreamWithoutEnd() {
  let ws = new SingleWriteStream;

  ws.cork();

  commonWSTestCase(ws, corkSingleWriteStreamWithoutEnd.name);
}

function corkSingleWriteStreamWithEnd() {
  let ws = new SingleWriteStream;

  ws.cork();

  commonWSTestCase(ws, corkSingleWriteStreamWithEnd.name);

  ws.end();
}

function corkConcatWriteStreamWithUncork() {
  let ws = new ConcatWriteStream;

  ws.cork();

  commonWSTestCase(ws, corkConcatWriteStreamWithUncork.name);

  ws.uncork();
}

function corkConcatWriteStreamWithEnd() {
  let ws = new ConcatWriteStream;

  ws.cork();

  commonWSTestCase(ws, corkConcatWriteStreamWithUncork.name);

  ws.end();
}

function drainSingleWriteStream() {
  let ws = new SingleWriteStream({
    highWaterMark: 2
  });

  ws.on('drain', () => {
    console.log(`${drainSingleWriteStream.name} drain now`);
    assert.equal(true, ws.write(6 + '', () => {
      console.log(`${new Date}: ${drainSingleWriteStream.name} write 6 successfully.`);
    }), 'after drain, write to stream should return true');
  });

  commonWSTestCase(ws, drainSingleWriteStream.name);
}

function drainConcatWriteStream() {
  let ws = new ConcatWriteStream({
    highWaterMark: 2
  });

  ws.on('drain', () => {
    console.log(`${drainConcatWriteStream.name} drain now`);
    assert.equal(true, ws.write(6 + '', () => {
      console.log(`${new Date}: ${drainSingleWriteStream.name} write 6 successfully.`);
    }), 'after drain, write to stream should return true');
  });

  commonWSTestCase(ws, drainConcatWriteStream.name);
}

drainConcatWriteStream();

module.exports = {
  SingleWriteStream,
  ConcatWriteStream,

  simpleSingleWriteStream,
  simpleConcatWriteStream,

  corkSingleWriteStreamWithoutEnd,
  corkSingleWriteStreamWithEnd,

  corkConcatWriteStreamWithUncork,
  corkConcatWriteStreamWithEnd
};