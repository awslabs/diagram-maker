const baseConfig = require('./webpack.common.js');
const path = require('path');
const merge = require('webpack-merge').merge;
const DeclarationBundlePlugin = require('./DeclarationBundlePlugin.js');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// TODO: We can add a threshold on the asset size in our build setp here.

module.exports = merge(baseConfig, {
  mode: 'production',
  devtool: 'source-map',
  bail: true,
  output: {
    filename: 'diagramMaker.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'diagramMaker',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    dagre: 'dagre'
  },
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    // Extract all CSS
    new MiniCssExtractPlugin({
      filename: 'diagramMaker.css'
    }),
    new DeclarationBundlePlugin({
      name: 'diagramMaker.d.ts',
      inlinedLibraries: ['redux', 'symbol-observable']
    })
  ],
  stats: {
    // This is because of a limitation in ts-loader
    // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalse
    warningsFilter: /export .* was not found in/
  }
});
