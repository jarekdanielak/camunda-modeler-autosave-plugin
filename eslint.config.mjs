import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  ignored: [
    'dist'
  ],
  client: [
    'client/**/*.js',
  ],
  build: [
    '*.js',
    '*.mjs',
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

  // client
  ...bpmnIoPlugin.configs.browser.map(config => {
    return {
      ...config,
      files: files.client
    };
  }),
  ...bpmnIoPlugin.configs.jsx.map((config) => {
    return {
      ...config,
      files: files.client
    };
  }),
  {
    settings: {
      react: { version: '16.14.0' }
    },
    files: files.client
  },
];