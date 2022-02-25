const baseConfig = require('./webpack.common.js');
const path = require('path');
const merge = require('webpack-merge').merge;
const BundleDeclarationsWebpackPlugin = require('bundle-declarations-webpack-plugin').default;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

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
    'dagre': 'dagre'
  },
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    // Extract all CSS
    new MiniCssExtractPlugin({
      filename: 'diagramMaker.css'
    }),
    new BundleDeclarationsWebpackPlugin({
      entry: {
        filePath: 'src/index.ts',
        libraries: {
          inlinedLibraries: ['redux']
        },
        output: {
          inlineDeclareGlobals: true
        }
      },
      outFile: 'diagramMaker.d.ts'
    })
  ],
  // This is because of a limitation in ts-loader
  // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalse
  ignoreWarnings: [/export .* was not found in/]
});
