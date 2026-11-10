import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)
const buildTestEntry = require.resolve('@webwriter/build/test')
const buildRequire = createRequire(buildTestEntry)
const esbuild = buildRequire('esbuild')
const inlineImportModule = buildRequire('esbuild-plugin-inline-import')
const inlineImport = inlineImportModule.default ?? inlineImportModule

await esbuild.build({
  entryPoints: ['tests/functionality.test.ts'],
  outfile: 'dist/tests/functionality.js',
  bundle: true,
  write: true,
  target: 'es2022',
  format: 'esm',
  plugins: [inlineImport()],
  loader: {
    '.json': 'json',
    '.html': 'text',
    '.xml': 'text',
    '.css': 'css',
    '.svg': 'dataurl',
  },
})
