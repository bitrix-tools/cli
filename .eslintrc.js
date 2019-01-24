module.exports = {
    "extends": [
        "airbnb-base",
        "plugin:flowtype/recommended",
    ],

    "parser": "babel-eslint",
    "plugins": [
        "babel",
        "flowtype",
    ],

    "env": {
        "browser": true,
    },

    "root": true,

    "rules": {
        "no-tabs": "off",
        "object-curly-spacing": ["error", "never"],
        "object-curly-newline": "off",
        "brace-style": "off",
        "implicit-arrow-linebreak": "off",
        "import/prefer-default-export": "off",
        "eol-last": "off",
        "comma-dangle": [
            "error",
            {
                "arrays": "always-multiline",
                "objects": "always-multiline",
                "imports": "always-multiline",
                "exports": "always-multiline",
                "functions": "ignore",
            }
        ],
        "space-before-function-paren": [
            "error",
            {
                "anonymous": "never",
                "named": "never",
                "asyncArrow": "always",
            }
        ],
        "lines-between-class-members": [
            "error",
            "always",
            {
                exceptAfterSingleLine: true
            },
        ],
        "no-console": [
            "error",
            {
                allow: [
                    "warn",
                    "error",
                    "info"
                ],
            },
        ],
        "indent": [
            "error",
            "tab",
            {
                "SwitchCase": 1
            }
        ],

        // Flow inspections
        "flowtype/no-types-missing-file-annotation": "off",
    }
};