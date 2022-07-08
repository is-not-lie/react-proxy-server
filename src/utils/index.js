const fs = require('fs')
const paths = require('./path')

const { configDir, webpackOverridePath } = paths
const __DEV__ = process.env.NODE_ENV === 'development';
const __PROD__ = process.env.NODE_ENV === 'production';

const appConfig = fs.existsSync(`${configDir}/index.js`)
  ? require(`${configDir}/index.js`)
  : {};
const override = fs.existsSync(webpackOverridePath)
  ? require(webpackOverridePath)
  : (config) => config;
const getBackEndUrl = (ctx) => {
  const { url, appConfig } = ctx;
  const urlMatch = url.match(/^\/common\/proxy\/([a-z]+)\/([a-z0-9\/:]+).*/);
  const serviceCode = urlMatch?.[1];
  const path = urlMatch?.[2];
  const host = serviceCode && appConfig.proxyConfig?.[serviceCode]?.url;
  if (!host) throw new Error('proxy error host is required');
  if (!path) throw new Error('proxy error path is required');
  return `${host}/${path}`;
};

module.exports = { ...paths, appConfig, override, __DEV__, __PROD__, getBackEndUrl };
