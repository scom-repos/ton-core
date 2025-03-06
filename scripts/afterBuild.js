const fs = require('fs');
const path = require('path');

let filePath = path.join(__dirname, '../dist/index.js');

let content = fs.readFileSync(filePath, 'utf8');
content = content
.replace(/"@ton\/crypto"/g, '"@scom/ton-crypto"');

fs.writeFileSync(filePath, content, 'utf8');