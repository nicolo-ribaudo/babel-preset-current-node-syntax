const babel = require("@babel/core");
const thisPreset = require("..");

const fixtures = require("./fixtures.json");
const VERSION_RE = /^v?(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?/;

const currentVersion = parseVersion(process.version);

console.log(`INFO - Running on node ${process.version}`);

for (const [name, [version, code, parser]] of Object.entries(fixtures)) {
  if (name.startsWith("#")) continue; // "JSON comments"

  const shouldThrow = parseVersion(version) > currentVersion;
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
    console.log(`OK - ${msg}, as expected.`);
  } else {
    console.log(`FAIL - ${msg}, unexpectedly.`);
    process.exitCode = 1;
  }
}

function selectParser(version = "@babel/parser-7.0.0") {
  return () => ({
    parserOverride: require(version).parse
  });
}

function parseVersion(v) {
  const { major, minor = 0, patch = 0 } = String(v).match(VERSION_RE).groups;
  return Number(major) * 1e8 + Number(minor) * 1e4 + Number(patch);
}
