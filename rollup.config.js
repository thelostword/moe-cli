/*
 * @Author: losting
 * @Date: 2022-04-01 16:04:32
 * @LastEditTime: 2022-05-12 11:56:13
 * @LastEditors: losting
 * @Description:
 * @FilePath: \rollup-template\rollup.config.js
 */

import typescript from '@rollup/plugin-typescript';
import sourceMaps from 'rollup-plugin-sourcemaps';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import path from 'path';
import { terser } from 'rollup-plugin-terser';
import scss from 'rollup-plugin-scss';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

import pkg from './package.json';

export default {
  input: './src/index.ts',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    sourceMaps(),
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
      ],
    }),
    scss({
      output: 'lib/moe.min.css',
      include: ['src/styles/*.scss'],
      watch: 'src/styles/*.scss',
      processor: () => postcss([autoprefixer()]),
      outputStyle: 'compressed',
    }),
  ],
  output: [
    {
      format: 'cjs',
      file: pkg.main,
      sourcemap: true,
      plugins: [terser()],
    },
    {
      format: 'esm',
      file: pkg.module,
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  onwarn: (msg, warn) => {
    warn(msg);
  },
};
