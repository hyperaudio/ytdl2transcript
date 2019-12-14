module.exports = {
  parserOptions: {
    parser: 'babel-eslint',
  },
  env: {
    browser: true,
    commonjs: true,
    node: true,
  },
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'no-shadow': 2,
    'no-useless-constructor': 'off',
    'no-undef': 'off',
    'prettier/prettier': 'error',
    'import/prefer-default-export': 'off',
  },
  plugins: ['prettier'],
};
