/**
 * Created by samhwang1990@gmail.com on 17/3/13.
 */

'use strict';

// process.arch：返回运行node.js 进程的cpu 架构，例如：'arm'、'ia32'、'x64'
console.log(`the processor architecture that node.js process is running on: ${process.arch}`);

// process.config：返回编译node.js 可执行程序时所用的配置选项
// This is the same as the `config.gypi` file that was produced when running the `./configure` script.
console.log(`\nthe configure options used to compile the current Node.js executable: \n${JSON.stringify(process.config)}\n`);

// process.platform：返回运行node.js 进程的系统平台，例如：'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
console.log(`the operating system platform on which the Node.js process is running: ${process.platform}`);

// process.release：返回当前node.js 的一些meta 信息
// 具体参考：https://nodejs.org/dist/latest-v6.x/docs/api/process.html#process_process_platform
console.log(`\nmetadata related to the current release: \n${JSON.stringify(process.release)}\n`);

// process.version：返回当前系统的node.js 版本
console.log(`node.js version: ${process.version}`);

// process.versions：列出node.js 及其依赖模块的版本信息
console.log(`\nlisting the version strings of Node.js and its dependencies:\n${JSON.stringify(process.versions)}\n`);