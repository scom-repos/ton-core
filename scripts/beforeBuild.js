const fs = require('fs');
const path = require('path');

let filePath = path.join(__dirname, '../ton-core/src/index.ts');

let content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(filePath, `///<amd-module name='@scom/ton-core' /> \n` + content + `\n export { paddedBufferToBits } from './boc/utils/paddedBits';`, 'utf8');