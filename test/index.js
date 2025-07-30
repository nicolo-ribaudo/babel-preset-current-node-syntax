const babel7 = require("@babel/core");
const babel8 = require("@babel/core-8");
const thisPreset = require("..");

const fixtures = require("./fixtures.json");
const VERSION_RE = /^v?(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?/;

const currentVersion = parseVersion(process.version);

console.log(`INFO - Running on node ${process.version}`);

for (const [name, [version, code, parser, skip]] of Object.entries(fixtures)) {
  if (name.startsWith("#")) continue; // "JSON comments"

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
    babel7.parseSync(code, {
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

  if (parser) continue;

  didThrow = false;
  try {
    babel8.parseSync(code, {
      configFile: false,
      presets: [thisPreset],
    });
  } catch {
    didThrow = true;
  }

  if (didThrow && !shouldThrow) {
    console.log(`FAIL - ${name} (${version}) threw in babel 8, unexpectedly.`);
    process.exitCode = 1;
  } else {
    console.log(`OK - ${name} (${version}) didn't throw in babel 8, as expected.`);
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
