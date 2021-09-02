const del = require('del');

function cleanOutput() {
  return del(['lib/']);
}

exports.default = cleanOutput;
