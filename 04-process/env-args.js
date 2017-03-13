/**
 * Created by samhwang1990@gmail.com on 17/3/13.
 */

'use strict';

const assert = require('assert');

/*
* process.env
*
* 存储进程的环境变量对象
*
* env 对象是可读写的：
* - 读：以对象方式读取，比如：process.env.PATH
* - 写：参考对象的写属性操作，需要注意的时，所更新或添加的值，会被转为字符串存储在env 对象中
* - 删：只能以delete process.env.propertyName 来删除env 对象中的属性
*
* 需要提醒一点，对process.env 对象的更改操作，包括添加属性、更改原有属性、删除属性，都只会在当前进程中生效
* */
function env() {
  console.log(`process env: ${JSON.stringify(process.env)}`);

  process.env.__test__ = undefined;
  process.env.__test1__ = null;
  process.env.__test2__ = [1, 2];
  process.env.__test3__ = true;
  process.env.__test4__ = 1;

  // 赋值给process.env 时，所使用的值会转换为string
  assert.deepEqual(process.env.__test__, 'undefined', '__test__ equal to \'undefined\'');
  assert.deepEqual(process.env.__test1__, 'null', '__test1__ equal to \'null\'');
  assert.deepEqual(process.env.__test2__, '1,2', '__test2__ equal to \'1,2\'');
  assert.deepEqual(process.env.__test3__, 'true', '__test3__ equal to \'true\'');
  assert.deepEqual(process.env.__test4__, '1', '__test4__ equal to \'1\'');

  // 要删除process.env 的属性，需要使用delete，而不是使用null
  delete process.env.__test__;
  delete process.env.__test1__;
  delete process.env.__test2__;

  assert.deepEqual(process.env.__test__, undefined, '__test__ removed');
  assert.deepEqual(process.env.__test1__, undefined, '__test1__ removed');
  assert.deepEqual(process.env.__test2__, undefined, '__test2__ removed');

  process.env.__test3__ = null;
  assert.deepEqual(process.env.__test3__, 'null', '__test3__ remove failed');
  delete process.env.__test3__;
  assert.deepEqual(process.env.__test3__, undefined, '__test3__ removed');

  process.env.__test4__ = undefined;
  assert.deepEqual(process.env.__test4__, 'undefined', '__test3__ remove failed');
  delete process.env.__test4__;
  assert.deepEqual(process.env.__test4__, undefined, '__test4__ removed');

}

/*
* process.argv
*
* 以数组形式存储启动进程的一些参数值：
* 0 - 可执行node 程序的路径
* 1 - 一般为入口模块的路径
* 2~N - 启动进程时额外的参数
*
* process.execPath
* 字符串类型表示可执行node 程序的路径，与process.argv[0] 相等
*
* process.execArgv
* 数组形式记录node 程序执行时使用的参数，注意，这里的参数与process.argv 中的参数是两个概念
*
* 举个例子：
* 执行以下命令，启动当前模块的node 进程：node --harmony ./env-args.js one two=three
*
* 则有如下值关系：
* process.execArgv = ['--harmony']
* process.execPath = '/usr/local/bin/node'
*
* process.argv = ['/usr/local/bin/node', 'path/to/env-args.js', 'one', 'two=three']
* */
function argv() {
  let argv = process.argv;

  let execArgv = process.execArgv;
  let execPath = process.execPath;

  console.log(`executable node path with process.argv[0]: ${argv[0]}`);
  console.log(`main module path: ${argv[1]}`);
  console.log(`received arguments: ${argv.slice(2)}`);

  console.log(`execute node path with process.execPath: ${execPath}`);
  console.log(`execute arguments: ${execArgv}`);
}

argv();

module.exports = {
  env,
  argv
};