# `babel-preset-current-node-syntax`

> A Babel preset that enables parsing of proposals supported by the current Node.js version.

## Installation

If you are using yarn:
```
yarn add --dev babel-preset-current-node-syntax
```

If you are using npm:
```
npm install --save-dev babel-preset-current-node-syntax
```

## Contributing

PRs are welcome! The codebase is so small that I didn't setup a linter, but try
to match the style of the existing code.

You can run tests with the following command:
```
yarn node test/index.js
```

The `test/fixtures.json` file contains a bunch of syntax tests, alongside with
the minimum supported node version for each of them. Babel should throw on
older versions, without support for that given syntax.

The tests run against whichever version of `@babel/core` is installed. By
default that is Babel 8, which supports all of these syntaxes natively. To test
against Babel 7 (which relies on this preset to enable the syntax plugins), you
can downgrade with:
```
npm install --no-save @babel/core@^7
```
CI runs the tests on Babel 8 on recent Node.js versions, and on Babel 7 across
the whole range of supported Node.js versions.
