const fs = require('fs');
const path = require('path');

let filePath = path.join(__dirname, '../dist/index.js');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(/"@ton\/crypto"/g, '"@scom/ton-crypto"');
fs.writeFileSync(filePath, content, 'utf8');

filePath = path.join(__dirname, '../dist/index.d.ts');
content = fs.readFileSync(filePath, 'utf8');
content = `declare module "symbol.inspect"{}\n${content}`;
fs.writeFileSync(filePath, content, 'utf8');