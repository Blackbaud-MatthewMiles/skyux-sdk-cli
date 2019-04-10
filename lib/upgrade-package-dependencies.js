const logger = require('@blackbaud/skyux-logger');
const fs = require('fs-extra');
const latestVersion = require('latest-version');

/**
 * Pass each dependency and it's requested version through the `install-latest` library.
 * This supports any valid semver version, but will resolve to the exact version.
 * @param {*} dependencies The dependencies with versions to resolve.
 */
async function setDependencyVersions(dependencies) {
  const packageNames = Object.keys(dependencies);

  const dependencyPromises = packageNames.map((packageName) => {
    return latestVersion(packageName, {
      version: dependencies[packageName]
    });
  });

  const versionNumbers = await Promise.all(dependencyPromises);

  packageNames.forEach((packageName, index) => {
    dependencies[packageName] = versionNumbers[index];
  });
}

async function upgradePackageDependencies(packagePath) {
  const message = logger.promise('Upgrading package dependencies.');

  const packageJson = fs.readJsonSync(packagePath);

  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.peerDependencies = packageJson.peerDependencies || {};

  await setDependencyVersions(packageJson.dependencies);
  await setDependencyVersions(packageJson.devDependencies);

  await fs.writeJson(
    packagePath,
    packageJson,
    {
      spaces: 2
    }
  );

  message.succeed('Package dependencies set.');
}

module.exports = upgradePackageDependencies;
