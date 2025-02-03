module.exports = {
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
  };

  module.exports = {
    testEnvironment: 'jsdom',
  };

  module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.[t|j]sx?$': 'babel-jest',
    },
    moduleNameMapper: {
      '\\.css$': 'identity-obj-proxy',
    },
    setupFiles: ['<rootDir>/jest.setup.cjs'],
  };