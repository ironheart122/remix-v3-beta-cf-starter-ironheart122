/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */

export default {
  plugins: ['prettier-plugin-packagejson'],
  arrowParens: 'always',
  endOfLine: 'lf',
  printWidth: 100,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
}
