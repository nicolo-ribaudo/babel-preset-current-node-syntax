const babel = require("@babel/core");
const thisPreset = require("..");

const fixtures = require("./fixtures.json");
const VERSION_RE = /^v?(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?/;

const currentVersion = parseVersion(process.version);
const isBabel8 = parseInt(babel.version, 10) >= 8;

console.log(
  `INFO - Running on node ${process.version} with @babel/core ${babel.version}`
);

for (const [name, [version, code, parser]] of Object.entries(fixtures)) {
  if (name.startsWith("#")) continue; // "JSON comments"

  if (isBabel8) {
    // Babel 8 supports all of these syntaxes natively and the preset adds no
    // plugins to it, so parsing should always succeed. Fixtures that pin a
    // specific @babel/parser@7 version are only relevant to Babel 7.
    if (parser) continue;

    let didThrow = false;
    try {
      babel.parseSync(code, { configFile: false, presets: [thisPreset] });
    } catch {
      didThrow = true;
    }

    if (didThrow) {
      console.log(`FAIL - ${name} (${version}) threw in babel 8, unexpectedly.`);
      process.exitCode = 1;
    } else {
      console.log(
        `OK - ${name} (${version}) didn't throw in babel 8, as expected.`
      );
    }

    continue;
  }

  // Babel 7: the preset only enables the syntax plugins supported by the
  // current Node.js version, so older Node.js versions are expected to throw.
  const shouldThrow = !(
    Array.isArray(version)
      ? version.map((v) => (Array.isArray(v) ? v : [v]))
      : [[version]]
  ).some(
    (version) =>
      currentVersion >= parseVersion(version[0]) &&
      (version.length === 1 || currentVersion < parseVersion(version[1]))
  );

  let didThrow = false;
  try {
    babel.parseSync(code, {
      configFile: false,
      presets: [thisPreset],
      plugins: [selectParser(parser)],
    });
  } catch {
    didThrow = true;
  }

  const msg = `${name} (${version}) ${didThrow ? "threw" : "didn't throw"}`;
  if (didThrow === shouldThrow) {
    console.log(`OK - ${msg} in babel 7, as expected.`);
  } else {
    console.log(`FAIL - ${msg} in babel 7, unexpectedly.`);
    process.exitCode = 1;
  }
}

function selectParser(version = "@babel/parser-7.0.0") {
  return () => ({
    parserOverride: require(version).parse,
  });
}

function parseVersion(v) {
  const { major, minor = 0, patch = 0 } = String(v).match(VERSION_RE).groups;
  return Number(major) * 1e8 + Number(minor) * 1e4 + Number(patch);
}
