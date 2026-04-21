/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/config$': '<rootDir>/src/testUtils/configStub.ts',
    '^@/config/index$': '<rootDir>/src/testUtils/configStub.ts',
    '^@/redux/store$': '<rootDir>/src/testUtils/storeStub.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass|less)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|webp|ttf|woff|woff2)$': '<rootDir>/src/testUtils/fileStub.ts',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: { ignoreCodes: ['TS151001'] },
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@wix|react-simple-wysiwyg)/)'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
