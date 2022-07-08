const fs = require('fs')
const Router = require('koa-router')
const connect = require('koa2-connect')
const { createProxyMiddleware } = require('http-proxy-middleware')
const { getBackEndUrl, routerDir } = require('../utils')

const router = new Router();

const setCustomRouters = (controllers) => {
  controllers.forEach(({ url, method, controller }) => {
    router[method](url, controller);
  });
};

router.all(/^\/common\/proxy\/*/, async (ctx, next) => {
  const path = getBackEndUrl(ctx);
  const request = connect(
    createProxyMiddleware({
      target: path,
      changeOrigin: true,
      ws: true,
    })
  );
  request(ctx, next);
});

if (fs.existsSync(routerDir)) {
  try {
    fs.readdirSync(routerDir).forEach(item => {
      if (/\.js$/g.test(item)) {
        const controolerExport = require(`${routerDir}/${item}`);
        const controllers = controolerExport.default
          ? controolerExport.default
          : controolerExport;
        Array.isArray(controllers) && setCustomRouters(controllers);
      }
    });
  } catch (error) {}
}

module.exports = router;
