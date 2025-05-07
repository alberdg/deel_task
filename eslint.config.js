module.exports = [
    {
        files: ["src/**/*.js"],
        ignores: ["**/*.config.js"],
        rules: {
            "semi": "error",
            "indent": "off",
            "no-console": "off",
            "prefer-destructuring": "off",
            "max-len": "off",
            "object-curly-newline": "off",
            "implicit-arrow-linebreak": "off",
            "semi": "off",
            "object-curly-spacing": ["error", "always"],
            "quotes": ["warn", "single", { "allowTemplateLiterals": true }],
            "eqeqeq": ["error", "always", {"null": "ignore"}],
        }
    }
];