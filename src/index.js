const tests = {
  "bigint": ["1n"],
  "numeric-separator": ["1_2"],
  "class-properties": [
    "(class { x = 1 })",
    "(class { #x = 1 })",
    "(class { #x() {} })",
  ],
  "logical-assignment-operators": ["a ||= b", "a &&= b", "a ??= c"],
};

const plugins = [];
const works = (test) => {
  try {
    // Wrap the test in a function to only test the syntax, without executing it
    (0, eval)(`(() => { ${test} })`);
    return true;
  } catch {
    return false;
  }
};

for (const [name, cases] of Object.entries(tests)) {
  if (cases.some(works)) {
    plugins.push(require.resolve(`@babel/plugin-syntax-${name}`));
  }
}

module.exports = () => ({ plugins });
