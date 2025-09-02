export default {
  transform: {
    '^.+\.m?js'
: 'babel-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'mjs'],
  transformIgnorePatterns: [
    '/node_modules/(?!yargs|yargs-parser)/',
  ],
};
