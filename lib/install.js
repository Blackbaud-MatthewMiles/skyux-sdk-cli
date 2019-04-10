const logger = require('@blackbaud/skyux-logger');
const fs = require('fs-extra');
const minimist = require('minimist');
const path = require('path');

const argv = minimist(process.argv.slice(2));
const npmInstall = require('./npm-install');
const upgradePackageDependencies = require('./upgrade-package-dependencies');

const settings = {};

if (logger.logLevel === 'verbose') {
  settings.stdio = 'inherit';
}

function remove(target) {
  const message = logger.promise(`Remove ${target}.`);

  return fs.remove(target)
    .then(() => message.succeed())
    .catch(err => {
      message.fail();
      logger.error(err);
    });
}

function removeNodeModules() {
  return remove('node_modules');
}

function removePackageLock() {
  return remove('package-lock.json');
}

function checkPackageDependencies() {
  const packagePath = path.resolve(process.cwd(), 'package.json');

  if (
    argv.latest &&
    fs.existsSync(packagePath)
  ) {
    return upgradePackageDependencies(packagePath);
  }
}

function install() {
  return removeNodeModules()
    .then(() => removePackageLock())
    .then(() => checkPackageDependencies())
    .then(() => npmInstall(settings))
    .catch(logger.error);
}

module.exports = install;
