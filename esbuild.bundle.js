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
  content = `
define("@scom/ton-core", ["require", "exports"], function (require, exports) {
  Object.defineProperty(exports, "__esModule", { value: true }); 
  ${content}
});`
  Fs.writeFileSync('dist/index.js', content)
  Fs.copyFileSync('scconfig.json', 'dist/scconfig.json')
}

build()
