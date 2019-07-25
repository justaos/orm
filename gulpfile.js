var gulp = require('gulp');
var del = require('del');

function cleanOutput() {
    return del([
        'lib/'
    ]);
}

exports.default = cleanOutput;
