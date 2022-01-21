import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import reactSvg from 'rollup-plugin-react-svg';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';

const nonbundledDependencies = Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies });
const nonExternalDependencies = [ 'preact-markup' ];

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
    external: externalDependencies(),
    plugins: [
      alias({
        entries: [
          { find: 'react', replacement: '@bpmn-io/properties-panel/preact/compat' },
          { find: 'preact', replacement: '@bpmn-io/properties-panel/preact' }
        ]
      }),
      reactSvg(),
      babel({
        babelHelpers: 'bundled',
        plugins: [
          [ '@babel/plugin-transform-react-jsx', {
            'importSource': '@bpmn-io/properties-panel/preact',
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


function externalDependencies() {
  return id => {
    return nonbundledDependencies.find(dep => id.startsWith(dep)) &&
      !nonExternalDependencies.find(dep => id.startsWith(dep));
  };
}