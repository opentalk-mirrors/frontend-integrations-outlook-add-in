import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/node_modules/**", "**/dist/**", "**/build/**", "**/coverage/**"]),
  tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    name: "root config",
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    name: "add-in",
    files: ["**/*.{mjs,js,jsx,ts,tsx}"],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-curly-brace-presence": ["error", "never"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
