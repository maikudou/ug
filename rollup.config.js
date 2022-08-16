import ts from '@rollup/plugin-typescript'

export default [
  {
    input: 'src/firefox/bg.ts',
    output: {
      sourcemap: 'inline',
      dir: 'build',
      format: 'iife',
      entryFileNames: 'firefox/[name].js'
    },
    plugins: [ts()]
  },
  {
    input: 'src/firefox/popup.ts',
    output: {
      sourcemap: 'inline',
      dir: 'build',
      format: 'iife',
      entryFileNames: 'firefox/[name].js'
    },
    plugins: [ts()]
  }
]
