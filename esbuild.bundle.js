const Fs = require('fs')

const {
  nodeModulesPolyfillPlugin,
} = require("esbuild-plugins-node-modules-polyfill");

async function readFile(fileName) {
  return new Promise((resolve, reject) => {
    Fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

async function build() {
  let result = await require('esbuild')
    .build({
        entryPoints: ['src/index.ts'],
        outfile: "dist/index.js",
        bundle: true,
        minify: false,
        format: 'cjs',
        external: ["bignumber.js", "@ton/crypto", "Buffer"],
        plugins: [nodeModulesPolyfillPlugin()],
        target: 'esnext'
    })
    .catch(() => process.exit(1))

  let content = await readFile('dist/index.js')
  content = content
    .replace(/path_1\.default/g, "path_1");
  Fs.writeFileSync('lib/index.js', content);
  
  content = `
define("@scom/ton-core", ["require", "exports"], function (require, exports) {
  Object.defineProperty(exports, "__esModule", { value: true }); 
  ${content}
});`
  Fs.writeFileSync('dist/index.js', content)
  Fs.copyFileSync('scconfig.json', 'dist/scconfig.json')

  let typesContent = Fs.readFileSync('dist/index.d.ts', 'utf8');
  const regex = /declare\smodule\s\"\@scom\/ton-core\"\s\{\n(.*?)\n\}\n/gs
  let mainContent = ''
  while ((match = regex.exec(typesContent))) {
    mainContent += match[1]
  }

  typesContent = `${typesContent}
/// <amd-module name="@ton/core" />
declare module "@ton/core" {
  ${mainContent}
}
`
  Fs.writeFileSync('dist/index.d.ts', typesContent)
}

build()
