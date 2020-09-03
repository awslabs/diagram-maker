const webpack = require('webpack');
const merge = require('webpack-merge').merge;
const baseConfig = require('./webpack.integ.js');
const os = require('os');

const devServerPort = 31213;

// Required for HMR
const hostname = process.env.REMOTE ? os.hostname() : 'localhost';

module.exports = merge(baseConfig, {
  mode: 'development',
  bail: false,
  devServer: {
    port: devServerPort,
    host: '0.0.0.0',
    hot: true,
    stats: {
      // This is because of a limitation in ts-loader
      // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalse
      warningsFilter: /export .* was not found in/
    }
  },
  devtool: 'source-map',
  output: {
    publicPath: `http://${hostname}:${devServerPort}/`
  },
  plugins: [
    // enable HMR globally
    new webpack.HotModuleReplacementPlugin()
  ]
});
