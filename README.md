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

The `test/fixtures` folder contain a bunch of files which should be parsed
starting from the node version in the filename, and throw in older versions.
All the tests are run using `@babel/parser@7.9.0`, which is the first version
supported by this preset.
