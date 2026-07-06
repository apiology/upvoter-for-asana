import { defineConfig } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import airbnbBase from 'airbnb-eslint9';
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
  {
    ignores: ['jest.setup.js', 'eslint.config.mjs', '.pnp*.*', '.pnp.cjs', 'coverage/**', 'dist/**', 'webpack.config.js', 'polyfills/**'],
  },
  ...airbnbBase,
  {
    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    )),

    plugins: {
        "@stylistic": stylistic,
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.webextensions,
        },

        parser: tsParser,
        ecmaVersion: 11,
        sourceType: "module",

        parserOptions: {
            ecmaVersion: '2018',
            project: "./tsconfig.json",
            sourceType: "module",
        },
    },

    settings: {
        "import/resolver": {
            typescript: {},
        },
    },

    rules: {
        "no-console": "off",
        "no-alert": "off",
        "class-methods-use-this": ["off"],

        "comma-dangle": "off",
        "@stylistic/comma-dangle": ["error", {
            arrays: "always-multiline",
            objects: "always-multiline",
            imports: "always-multiline",
            exports: "always-multiline",
            functions: "never",
        }],

        "@stylistic/indent": ["error", 2, {
          "FunctionDeclaration": { "returnType": 1 },
        }],

        "dot-notation": "off",
        "@typescript-eslint/dot-notation": "warn",
        "import/prefer-default-export": ["off"],
        "import/extensions": ["off"],
        "import/no-default-export": ["error"],

        "import/no-extraneous-dependencies": ["error", {
            devDependencies: [
                "**/*.test.tsx",
                "**/*.test.ts",
                "**/*.spec.ts",
                "**/*.spec.tsx",
                "jest.setup.js",
                "webpack.config.js",
            ],
        }],

        strict: ["error", "safe"],

        "no-restricted-syntax": ["error", {
            selector: "ForInStatement",
            message: "for..in loops iterate over the entire prototype chain, which is virtually never what you want.Use Object.{keys,values,entries}, and iterate over the resulting array.",
        }, {
            selector: "LabeledStatement",
            message: "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
        }, {
            selector: "WithStatement",
            message: "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
        }],

        "no-param-reassign": ["error", {
            props: false,
        }],

        "no-use-before-define": "off",
        "prefer-regex-literals": "off",
        "@typescript-eslint/no-use-before-define": "warn",
    },
  },
  {
    files: ["src/upvoter-for-asana.test.ts"],

    rules: {
        "max-len": "off",
    },
}]);
