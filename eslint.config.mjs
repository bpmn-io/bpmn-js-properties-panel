import bpmnIoPlugin from 'eslint-plugin-bpmn-io';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

const buildScripts = [ '*.js', '*.mjs' ];

export default [
  {
    ignores: [
      'dist'
    ]
  },
  ...bpmnIoPlugin.configs.browser,
  ...bpmnIoPlugin.configs.jsx,
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
    }
  },
  ...bpmnIoPlugin.configs.node.map(config => {
    return {
      ...config,
      files: [
        ...buildScripts,
        '**/test/**/*.js'
      ]
    };
  }),
  ...bpmnIoPlugin.configs.mocha.map(config => {
    return {
      ...config,
      files: [
        '**/test/**/*.js'
      ]
    };
  }),
  {
    languageOptions: {
      globals: {
        sinon: true
      },
    },
    files: [
      '**/test/**/*.js'
    ]
  },
  {
    rules: {
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off'
    }
  }
];
