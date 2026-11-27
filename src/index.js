function works(test) {
  try {
    // Wrap the test in a function to only test the syntax, without executing it
    (0, eval)(`(() => { ${test} })`);
    return true;
  } catch (_error) {
    return false;
  }
}

// Parser plugins enabled by the corresponding @babel/plugin-syntax-* packages.
// They are inlined to avoid depending on those packages, which only declare a
// peer dependency on Babel 7.
const parserPlugins = {
  "object-rest-spread": ["objectRestSpread"],
  "async-generators": ["asyncGenerators"],
  "optional-catch-binding": ["optionalCatchBinding"],
  "json-strings": ["jsonStrings"],
  bigint: ["bigInt"],
  "optional-chaining": ["optionalChaining"],
  "nullish-coalescing-operator": ["nullishCoalescingOperator"],
  "numeric-separator": ["numericSeparator"],
  "logical-assignment-operators": ["logicalAssignment"],
  "class-properties": [
    "classProperties",
    "classPrivateProperties",
    "classPrivateMethods",
  ],
  "private-property-in-object": ["privateIn"],
  "class-static-block": ["classStaticBlock"],
  "import-meta": ["importMeta"],
  "top-level-await": ["topLevelAwait"],
};

// A single plugin that enables all the given parser plugins
function syntaxPlugin(plugins) {
  return () => ({
    name: "syntax-current-node",
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push(...plugins);
    },
  });
}

// Same behavior as @babel/plugin-syntax-import-attributes
function syntaxImportAttributes() {
  let deprecatedAssertSyntax = false;
  return {
    name: "syntax-import-attributes",
    manipulateOptions({ parserOpts, generatorOpts }) {
      if (generatorOpts.importAttributesKeyword == null) {
        generatorOpts.importAttributesKeyword = "with";
      }
      const index = parserOpts.plugins.indexOf("importAssertions");
      if (index !== -1) {
        parserOpts.plugins.splice(index, 1);
        deprecatedAssertSyntax = true;
      }
      if (deprecatedAssertSyntax) {
        parserOpts.plugins.push("deprecatedImportAssert", [
          "importAttributes",
          { deprecatedAssertSyntax: true },
        ]);
      } else {
        parserOpts.plugins.push("importAttributes");
      }
    },
  };
}

function getParserPlugins(tests) {
  const plugins = [];
  for (const [name, cases] of Object.entries(tests)) {
    if (cases.some(works)) {
      plugins.push(...parserPlugins[name]);
    }
  }
  return plugins;
}

const babel7OnlyParserPlugins = getParserPlugins({
  // ECMAScript 2018
  "object-rest-spread": ["({ ...{} })", "({ ...x } = {})"], // Babel 7.2.0
  "async-generators": ["async function* f() {}"], //  Babel 7.2.0

  // ECMAScript 2019
  "optional-catch-binding": ["try {} catch {}"], // Babel 7.2.0
  "json-strings": ["'\\u2028'"], // Babel 7.2.0

  // ECMAScript 2020
  bigint: ["1n"], // Babel 7.8.0
  "optional-chaining": ["a?.b"], // Babel 7.9.0
  "nullish-coalescing-operator": ["a ?? b"], // Babel 7.9.0
  // import.meta is handled manually

  // ECMAScript 2021
  "numeric-separator": ["1_2"],
  "logical-assignment-operators": ["a ||= b", "a &&= b", "a ??= c"],

  // ECMAScript 2022
  "class-properties": [
    "(class { x = 1 })",
    "(class { #x = 1 })",
    "(class { #x() {} })",
  ],
  "private-property-in-object": ["(class { #x; m() { #x in y } })"],
  "class-static-block": ["(class { static {} })"],
  // top-level await is handled manually

  // Stage 3
  // import attributes is handled manually
});

const commonParserPlugins = getParserPlugins({});

// import.meta is only allowed in modules, and modules can only be evaluated
// synchronously. For this reason, we cannot detect import.meta support at
// runtime. It is supported starting from 10.4, so we can check the version.
const major = parseInt(process.versions.node, 10);
const minor = parseInt(process.versions.node.match(/^\d+\.(\d+)/)[1], 10);
if (major > 10 || (major === 10 && minor >= 4)) {
  babel7OnlyParserPlugins.push(...parserPlugins["import-meta"]);
}
// Same for top level await - it is only supported in modules. It is supported
// from 14.3.0
if (major > 14 || (major === 14 && minor >= 3)) {
  babel7OnlyParserPlugins.push(...parserPlugins["top-level-await"]);
}

// Similar for import attributes
const supportsImportAttributes =
  major > 20 || (major === 20 && minor >= 10) || (major === 18 && minor >= 20);

const babel7Plugins = [
  syntaxPlugin(babel7OnlyParserPlugins.concat(commonParserPlugins)),
];
if (supportsImportAttributes) {
  babel7Plugins.push(syntaxImportAttributes);
}

const babel8Plugins =
  commonParserPlugins.length > 0 ? [syntaxPlugin(commonParserPlugins)] : [];

module.exports = ({ version }) => ({
  plugins: version.startsWith("7.") ? babel7Plugins : babel8Plugins,
});
