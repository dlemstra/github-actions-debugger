import { defineConfig } from "eslint/config";
import pluginLicenseHeader from "eslint-plugin-license-header";
import pluginTypescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([{
    files: [
        "**/*.ts"
    ],

    ignores: [
        "**/dist",
        "lib/*",
    ],

    plugins: {
        "@eslint-plugin-license-header": pluginLicenseHeader,
        "@typescript-eslint": pluginTypescriptEslint,
    },

    extends: [
        "@typescript-eslint/eslint-recommended",
        "@typescript-eslint/recommended",
    ],

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        "@eslint-plugin-license-header/header": [
            "error",
            [
                "/*",
                "  Copyright Dirk Lemstra https://github.com/dlemstra/github-actions-debugger.",
                "  Licensed under the Apache License, Version 2.0.",
                "*/",
            ]
        ]
    }
}]);
