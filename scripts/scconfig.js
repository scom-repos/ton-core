const fs = require('fs');
const path = require('path');

const packPath = path.join(__dirname, '../package.json');
const scconfigPath = path.join(__dirname, '../scconfig.json');
const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
let scconfig = JSON.parse(fs.readFileSync(scconfigPath, 'utf8'));
scconfig.version = pack.version;
fs.writeFileSync(path.join(__dirname, '../dist/scconfig.json'), JSON.stringify(scconfig, null, 4), 'utf8');