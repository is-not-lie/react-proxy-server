const fs = require('fs');
const { middlewareDir } = require('../utils');
const webpackDevMiddleware = require('./webpackDevMiddleware')
const webpackHotMiddleware = require('./webpackHotMiddleware')

const customeMiddlewares = [];

/** @description 读取自定义中间件 */
if (fs.existsSync(middlewareDir)) {
  fs.readdirSync(middlewareDir).forEach((item) => {
    if (/\.js$/.test(item)) {
      try {
        const middlewareExport = require(`${middlewareDir}/${item}`);
        const middleware =
          middlewareExport && middlewareExport.default
            ? middlewareExport.default
            : middlewareExport;
        middleware && customeMiddlewares.push(middleware);
      } catch (error) {
        // 读取不到则默认跳过
        console.log(error);
      }
    }
  });
}

const setCustomeMiddleware = (app) => {
  customeMiddlewares.forEach((middleware) => {
    app.use(middleware);
  });
};

module.exports = {
  setCustomeMiddleware,
  webpackDevMiddleware,
  webpackHotMiddleware
}
