const path = require('path')
const fs = require('fs')

const workDir = fs.realpathSync(process.cwd());

const resolvePath = (realativePath) =>
  path.resolve(workDir, realativePath);

const configDir = resolvePath('configs');
const middlewareDir = resolvePath('middleware');
const routerDir = resolvePath('routers');
const webpackOverridePath = resolvePath('webpack_override.js');
const outputPath = path.resolve(__dirname, '../public');
const tmplPath = path.resolve(__dirname, '../template/index.pug');

module.exports = {
  workDir,
  configDir,
  webpackOverridePath,
  outputPath,
  tmplPath,
  middlewareDir,
  routerDir,
  resolvePath,
};
