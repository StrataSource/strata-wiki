module.exports = {
    extends: ['eslint:recommended', 'plugin:unicorn/recommended', 'prettier'],
    rules: {
        'no-var': ['error'],
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-unused-vars': ['off'],
        "prefer-const": ["error"],
        eqeqeq: ['error'],
        'unused-imports/no-unused-vars': [
            'warn',
            {
                vars: 'all',
                args: 'after-used',
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_'
            }
        ],
        // Way too sensitive. Most cases it catches are silly, and bad naming is easy to flag in review.
        'unicorn/prevent-abbreviations': ['off'],
        // Not going to make devs use obscure JS syntax for something so minor.
        'unicorn/numeric-separators-style': ['warn', { onlyIfContainsSeparator: true }],
        // Removing `null` entirely is a noble intention, but reality is that many libraries use it explicitly,
        // especially Prisma. Plus, it's an further obscure thing for new devs to learn about. Better to flag bad uses
        // in review, where the distinction can be explained.
        'unicorn/no-null': ['off'],
        // We're still on CJS for now, not bothering with path aliasing on ES modules yet. Can remove if we switch to ES.
        'unicorn/prefer-module': ['off'],
        // Same as above.
        'unicorn/prefer-top-level-await': ['off'],
        // Even though unicorn has a rule for no nested ternaries, it's insisting I make them due to this rule.
        'unicorn/prefer-ternary': ['error', 'only-single-line'],
        // Better parity with other languages, we use `1 << 0` frequently next to other shifts when defining bitflags.
        'unicorn/prefer-math-trunc': ['off'],
        // Why???
        'unicorn/switch-case-braces': ['off'],
        // Browsers don't provide a nice way to determine if an event listener exists or not. Worth using listeners
        // when possible, but at times using an `on`-function results in simpler code.
        'unicorn/prefer-add-event-listener': ['off'],
        // .innerText is useful for finding anchor nodes in the DOM
        'unicorn/prefer-dom-node-text-content': ['warn']
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            parserOptions: {
                project: 'tsconfig.json',
                sourceType: 'default'
            },
            plugins: ['@typescript-eslint/eslint-plugin', 'unicorn', 'unused-imports', 'prettier'],
            extends: ['plugin:@typescript-eslint/recommended'],
            rules: {
                '@typescript-eslint/interface-name-prefix': 'off',
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unused-vars': 'off',
                'unused-imports/no-unused-imports': 'error',
                '@typescript-eslint/no-inferrable-types': ['warn', { ignoreParameters: true }]
            }
        }
    ],
    root: true,
    env: {
        node: true,
        es2022: true
    },
    ignorePatterns: ['.eslintrc.js', 'node_modules', '_*.ts', 'build', '**/*.d.ts']
};
