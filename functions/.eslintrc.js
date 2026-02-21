module.exports = {
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2022,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": "off",
    "object-curly-spacing": "off",
    "max-len": "off",
    "indent": "off",
    "comma-dangle": "off",
    "semi": "off",
    "arrow-parens": "off",
    "padded-blocks": "off",
    "no-trailing-spaces": "off",
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
