module.exports = {
    extends: ['../../../.eslintrc.js'],
    rules: {
        // We don't have a proper import system so ESLint can't find stuff from separate files even if in same
        // JS scope.
        'no-undef': ['off']
    },
    env: {
        browser: true,
        es2022: true
    }
};
