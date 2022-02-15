const webpack = require('webpack');
const merge = require('webpack-merge').merge;
const baseConfig = require('./webpack.integ.js');
const os = require('os');

const devServerPort = 31213;

module.exports = merge(baseConfig, {
  mode: 'development',
  bail: false,
  devServer: {
    port: devServerPort,
    hot: true
  },
  devtool: 'source-map',
  // This is because of a limitation in ts-loader
  // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalse
  ignoreWarnings: [/export .* was not found in/]
});
