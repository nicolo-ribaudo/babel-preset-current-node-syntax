const fs = require("fs");
const babel = require("@babel/core");
const thisPreset = require("..");

const fixtureVersions = ["10.8", "12.4", "12.8"];
const VERSION_RE = /^v?(?<major>\d+)\.(?<minor>\d+)(\.(?<patch>\d+))?/;

const currentVersion = parseVersion(process.version);

console.log(`INFO - Running on node ${process.version}`);

for (const version of fixtureVersions) {
  const code = fs.readFileSync(`${__dirname}/fixtures/node-${version}.js`, "utf8");
  
  const shouldThrow = parseVersion(version) > currentVersion;
  let didThrow = false;

  try {
    babel.parseSync(code, { configFile: false, presets: [thisPreset] });
  } catch {
    didThrow = true;
  }

  if (didThrow === shouldThrow) {
    console.log(`OK - ${version} ${didThrow ? "threw" : "didn't throw"}, as expected.`);
  } else {
    console.log(`FAIL - ${version} ${didThrow ? "threw" : "didn't throw"}, unexpectedly.`);
    process.exitCode = 1;
  }
}

function parseVersion(v) {
  const { major, minor, patch = 0 } = v.match(VERSION_RE).groups;
  return Number(major) * 1e8 + Number(minor) * 1e4 + Number(patch);
}
