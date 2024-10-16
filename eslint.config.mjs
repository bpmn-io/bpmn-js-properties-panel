import bpmnIoPlugin from 'eslint-plugin-bpmn-io';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

const files = {
  build: [
    '*.js',
    '*.mjs',
    'test/distro/distroSpec.js'
  ],
  test: [
    'test/**/*.js'
  ],
  ignored: [
    'dist'
  ]
};


export default [
  {
    ignores: files.ignored
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {
    return {
      ...config,
      files: files.build
    };
  }),

  // lib + test
  ...bpmnIoPlugin.configs.browser.map(config => {
    return {
      ...config,
      ignores: files.build
    };
  }),
  ...bpmnIoPlugin.configs.jsx.map(config => {
    return {
      ...config,
      ignores: files.build
    };
  }),

  // misc
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
      import: importPlugin
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'import/first': 'error',
      'import/no-amd': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'react-hooks/exhaustive-deps': 'off'
    },
    ignores: files.build
  },
  {
    rules: {
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off'
    }
  },

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {
    return {
      ...config,
      files: files.test
    };
  }),
  {
    languageOptions: {
      globals: {
        sinon: true,
        require: true
      },
    },
    files: files.test
  }
];
