const path = require('path')
const fs = require('fs')

const __DEV__ = process.env.NODE_ENV === 'development'
const __PROD__ = process.env.NODE_ENV === 'production'
const workDir = fs.realpathSync(process.cwd())

const resolvePath = (realativePath) => path.resolve(workDir, realativePath)

const configDir = resolvePath('configs')
const middlewareDir = __DEV__
  ? resolvePath('middleware')
  : path.resolve(__dirname, '../middleware/custom')
const routerDir = __DEV__ ? resolvePath('routers') : path.resolve(__dirname, '../routers/custom')
const webpackOverridePath = resolvePath('webpack_override.js')
const outputPath = path.resolve(__dirname, '../public/js')
const tmplPath = path.resolve(__dirname, '../template/index.pug')
const copyMiddlewareDir = resolvePath('middleware')
const copyRoutesDir = resolvePath('routers')

module.exports = {
  __DEV__,
  __PROD__,
  workDir,
  configDir,
  webpackOverridePath,
  outputPath,
  tmplPath,
  middlewareDir,
  routerDir,
  copyMiddlewareDir,
  copyRoutesDir,
  resolvePath
}
