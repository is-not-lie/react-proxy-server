const Koa = require('koa')
const koaStatic = require('koa-static')
const compress = require('koa-compress')
const koaBody = require('koa-body')
const webpack = require('webpack')
const { historyApiFallback } = require('koa2-connect-history-api-fallback')
const router = require('./routers')
const { __DEV__, __PROD__, appConfig } = require('./utils')
const webpackConfig = require('./webpack')
const {
  webpackDevMiddleware,
  webpackHotMiddleware,
  setCustomeMiddleware,
} = require('./middleware')

const app = new Koa();
const port = appConfig.port ?? 3000;
const logger = console.log;

app.use(async (ctx, next) => {
  ctx.appConfig = appConfig;
  await next();
});
app.use(historyApiFallback());
app.use(koaStatic(webpackConfig.output.path));
app.use(
  compress({
    threshold: 2048,
    gzip: {
      flush: require('zlib').constants.Z_SYNC_FLUSH,
    },
  })
);

if (__DEV__) {
  const compiler = webpack(webpackConfig);
  app
    .use(
      webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output?.publicPath,
      })
    )
    .use(
      webpackHotMiddleware(compiler, {
        log: false,
        path: `/__webpack_hmr`,
        heartbeat: 10 * 1000,
      })
    );
}
setCustomeMiddleware(app);
app.use(router.allowedMethods());
app.use(router.routes());
app.use(
  koaBody({
    multipart: true,
  })
);

app.listen(port, () => logger(`🚀 ~~~ server running in ${port}`)).timeout =
  60 * 60 * 1000;
