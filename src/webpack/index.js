const {
  resolvePath,
  outputPath,
  appConfig,
  tmplPath,
  override,
  __DEV__,
  __PROD__,
} = require('../utils')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const { HotModuleReplacementPlugin, ProgressPlugin } = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const useStyleLoaders = (
  cssOptions = {},
  loader,
  options = {}
) => {
  const loaders = [
    __PROD__ ? MiniCssExtractPlugin.loader : 'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: loader ? 2 : 1,
        ...cssOptions,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          ident: 'postcss',
          config: false,
          plugins: [
            'postcss-flexbugs-fixes',
            [
              'postcss-preset-env',
              { autoprefixer: { flexbox: 'no-2009' }, stage: 3 },
            ],
            'postcss-normalize',
          ],
        },
      },
    },
  ];

  if (loader) loaders.push({ loader, options });
  return loaders;
};

let entry = {
  app: resolvePath('app/index.tsx'),
};

const loaders = [
  {
    test: /\.(t|j)sx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: [
        ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }],
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: [],
    },
  },
  {
    test: /\.css$/,
    use: useStyleLoaders({ modules: { mode: 'icss' } }),
  },
  {
    test: /\.module\.css$/,
    use: useStyleLoaders({ modules: { mode: 'local' } }),
  },
  {
    test: /\.less$/,
    use: useStyleLoaders({ modules: { mode: 'icss' } }, 'less-loader', {
      lessOptions: { javaScriptEnabled: true },
    }),
  },
  {
    test: /\.module\.less$/,
    use: useStyleLoaders({ modules: { mode: 'local' } }, 'less-loader', {
      lessOptions: { javaScriptEnabled: true },
    }),
  },
  {
    test: /\.s(c|a)ss$/,
    use: useStyleLoaders({ module: { mode: 'icss' } }, 'sass-loader', {
      sassOptions: {
        javaScriptEnabled: true,
      },
    }),
  },
  {
    test: /\.module\.s(c|a)ss$/,
    use: useStyleLoaders({ module: { mode: 'local' } }, 'sass-loader', {
      sassOptions: { javaScriptEnabled: true },
    }),
  },
  {
    test: /\.pug$/,
    loader: 'pug-loader',
  },
  {
    test: /\.(png|jpe?g|git|webp|svg)$/,
    type: 'asset',
    generator: {
      filename: 'images/[name].[hash:8][ext]',
    },
    parser: {
      dataUrlCondition: {
        maxSize: 1024 * 8,
      },
    },
  },
  {
    exclude:
      /\.(png|jpe?g|git|webp|svg|tsx?|jsx?|json|css|scss|sass|less|html|vue)$/,
    type: 'asset/resource',
    generator: {
      filename: 'assets/[name].[hash:8][ext]',
    },
  },
];

const plugins = [
  new ProgressPlugin(),
  new NodePolyfillPlugin(),
  new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: [outputPath] }),
  new HtmlWebpackPlugin({
    template: tmplPath,
    ...appConfig,
    ...(__PROD__ && {
      minify: {
        removeComments: true,
        removeTagWhitespace: true,
      },
    }),
  }),
];

if (appConfig.entry) entry = appConfig.entry;
if (__DEV__) {
  loaders[0]?.options.plugins.push(
    'react-refresh/babel'
  );
  plugins.push(
    new ReactRefreshPlugin({ overlay: { sockIntegration: 'whm' } }),
    new HotModuleReplacementPlugin()
  );
}
if (__PROD__) {
  plugins.push(
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:10].css',
      chunkFilename: 'css/[name].[contenthash:10].chunk.css',
    })
  );
}

const config = {
  mode: __DEV__ ? 'development' : __PROD__ ? 'production' : 'none',
  devtool: __DEV__ ? 'inline-source-map' : false,
  entry,
  output: {
    ...appConfig.output,
    path: outputPath,
    filename: __DEV__ ? '[name].js' : '[name].[contenthash:10].js',
    chunkFilename: __DEV__
      ? '[name].chunk.js'
      : '[name].[contenthash:10].chunk.js',
    publicPath: __DEV__ ? '/' : './',
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      url: require.resolve('url'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
      fs: false,
      path: require.resolve('path-browserify'),
    },
    ...appConfig.resolve,
  },
  module: { rules: [{ oneOf: loaders }] },
  plugins,
  optimization: {
    minimize: __PROD__,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,
            ecma: 5,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxSize: 1024 * 1024,
      minSize: (1024 * 1024) / 2,
    },
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 50000000,
    maxAssetSize: 30000000,
    assetFilter: (filename) => filename.endsWith('.js'),
  },
};

module.exports = override(config);
