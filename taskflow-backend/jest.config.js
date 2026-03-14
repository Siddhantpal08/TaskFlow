module.exports = {
    testEnvironment: 'node',
    clearMocks: true,
    restoreMocks: true,
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    forceExit: true, // helps with hanging db connections or sockets
    detectOpenHandles: true,
    setupFilesAfterEnv: ['./tests/setup.js']
};
