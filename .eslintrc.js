var OFF = 0, WARN = 1, ERROR = 2;

module.exports = exports = {
    "env": {
        "browser": true,
        "node": true,
        "mocha": true
    },

    "ecmaFeatures": {
        // env=es6 doesn't include modules, which we are using
        "modules": true
    },

    "extends": "eslint:recommended",

    "rules": {
        "indent": [ ERROR, "tab" ],
        "no-console": [ ERROR ],
        "semi": [ ERROR, "never" ]
    }

    "globals": {
        "console"
    }
};
