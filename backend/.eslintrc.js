module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:security/recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
    },
    plugins: ['security'],
    rules: {
        'security/detect-object-injection': 'error',
        'security/detect-non-literal-fs-filename': 'warn',
        'security/detect-eval-with-expression': 'error',
        'security/detect-no-csrf-before-method-override': 'error',
        'security/detect-buffer-noassert': 'error',
        'security/detect-child-process': 'warn',
        'security/detect-disable-mustache-escape': 'error',
        'security/detect-non-literal-require': 'warn',
        'security/detect-possible-timing-attacks': 'error',
        'security/detect-pseudoRandomBytes': 'error',
        // Allow console.log for now, or warn
        'no-console': 'off',
        'no-unused-vars': 'warn'
    },
};
