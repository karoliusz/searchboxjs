import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import scss from 'rollup-plugin-scss';
import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';

const name = 'dist/searchboxjs';
const iifeName = 'SearchBoxJS';

const configs = [
  defineConfig({
    input: 'src/index.ts',
    external: ['rxjs', 'rxjs/operators'],
    plugins: [
      scss(),
      esbuild(),
    ],
    output: [
      {
        file: `${name}.js`,
        format: 'es',
        sourcemap: true,
      }
    ],
  }),
  defineConfig({
    input: 'src/index.ts',
    external: ['./scss/main.scss'],
    plugins: [
      nodeResolve(),
      esbuild({
        minify: true,
        target: 'es2017'
      }),
    ],
    output: [
      {
        file: `${name}.min.js`,
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
      file: `${name}.d.ts`,
      format: 'es',
    },
  })
];

export default configs;