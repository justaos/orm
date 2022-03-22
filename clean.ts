import FileUtils from '@justaos/file-utils';

async function cleanOutput() {
  await FileUtils.delete(['lib/']);
}

cleanOutput();
