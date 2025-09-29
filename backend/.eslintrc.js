module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    commonjs: true,
  },
  extends: [
    "eslint:recommended",
    "prettier", // disables eslint rules that conflict with prettier
  ],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "next" }],
    "no-console": "warn",
    "no-debugger": "error",
    "no-var": "error",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "no-trailing-spaces": "error",
    "no-multiple-empty-lines": ["error", { "max": 1 }],
    "comma-dangle": ["error", "always-multiline"],
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "indent": ["error", 2],
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "*.min.js",
    "coverage/",
  ],
};