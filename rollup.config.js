import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import scss from 'rollup-plugin-scss';
import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';

const scriptFileName = 'searchboxjs';
const iifeName = 'SearchBoxJS';

const configs = [
  defineConfig({
    input: 'src/index.ts',
    external: ['rxjs', 'rxjs/operators'],
    plugins: [esbuild(), scss({ output: false })],
    output: [
      {
        file: `dist/${scriptFileName}.js`,
        format: 'es',
        sourcemap: true,
      }
    ],
  }),
  defineConfig({
    input: 'src/index.ts',
    plugins: [
      scss(),
      nodeResolve(),
      esbuild({
        minify: true,
        target: 'es2017'
      })
    ],
    output: [
      {
        file: `dist/${scriptFileName}.min.js`,
        format: 'iife',
        sourcemap: true,
        name: iifeName
      }
    ],
  }),
  defineConfig({
    input: 'src/index.ts',
    plugins: [
      scss(),
      nodeResolve(),
      esbuild({
        minify: true,
        target: 'es2017'
      })
    ],
    output: [
      {
        file: `demo/${scriptFileName}.min.js`,
        format: 'iife',
        sourcemap: true,
        name: iifeName
      }
    ],
  }),
  defineConfig({
    input: 'src/index.ts',
    external: ['rxjs', 'rxjs/operators', './scss/main.scss'],
    plugins: [dts()],
    output: {
      file: `dist/${scriptFileName}.d.ts`,
      format: 'es',
    },
  })
];

export default configs;