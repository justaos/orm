const { FileUtils } = require('@p4rm/utils');

function cleanOutput() {
  FileUtils.delete(['lib/']);
}

cleanOutput();
