const {default: FileUtils} = require('@p4rm/file-utils');

function cleanOutput() {
  return FileUtils.delete([
    'lib/'
  ]);
}

cleanOutput();
