const baseConfig = require('./webpack.integ.js');
const path = require('path');
const merge = require('webpack-merge').merge;

module.exports = merge(baseConfig, {
  mode: 'production',
  bail: true,
  output: {
    path: path.resolve(__dirname, 'dist/examples'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [
          /src/
        ],
        exclude: [
          /node_modules/,
          /\.spec\.tsx?$/
        ],
        enforce: 'post',
        loader: 'babel-loader',
        options: {
          plugins: ["istanbul"]
        }
      }
    ]
  },
  // This is because of a limitation in ts-loader
  // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalse
  ignoreWarnings: [/export .* was not found in/]
});
