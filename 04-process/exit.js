/**
 * Created by samhwang1990@gmail.com on 17/3/13.
 */

'use strict';

function exitCode() {
  process.on('exit', exitCode => {
    console.log(`process exited with ${exitCode}`);
  });
  process.exitCode = 3;
}

function exit() {
  process.on('exit', exitCode => {
    console.log(`process exited with ${exitCode}`);
  });
  process.exit(4);
}

exit();