import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import reactSvg from 'rollup-plugin-react-svg';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: [
      {
        sourcemap: true,
        format: 'commonjs',
        file: pkg.main
      },
      {
        sourcemap: true,
        format: 'esm',
        file: pkg.module
      }
    ],
    external: [
      'array-move',
      'min-dash',
      'preact',
      'preact/jsx-runtime',
      'preact/hooks',
      'preact/compat',
      '@bpmn-io/properties-panel'
    ],
    plugins: [
      alias({
        entries: [
          { find: 'react', replacement: 'preact/compat' },
          { find: 'react-dom', replacement: 'preact/compat' }
        ]
      }),
      reactSvg(),
      babel({
        babelHelpers: 'bundled',
        plugins: [
          [ '@babel/plugin-transform-react-jsx', {
            'importSource': 'preact',
            'runtime': 'automatic'
          } ]
        ]
      }),
      copy({
        targets: [
          { src: 'node_modules/@bpmn-io/properties-panel/assets/**/*.css', dest: 'dist/assets' },
          { src: 'assets/*.css', dest: 'dist/assets' }
        ]
      }),
      json(),
      resolve(),
      commonjs()
    ]
  }
];