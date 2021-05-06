module.exports = {
    overrides: [
        {
            files: ['*.test.ts'],
            rules: {
                '@typescript-eslint/no-unused-expressions': 'off',
            },
        },
    ],
}
