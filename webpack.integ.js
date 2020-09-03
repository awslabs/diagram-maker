const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).filter(name => isDirectory(join(source, name)))

// Filter out scss directory
const getEntryPointsFromFolderStructure = () =>
  getDirectories('./integ').filter(name => name !== 'scss')

const getEntries = () => {
  const folders = getEntryPointsFromFolderStructure();
  return folders.reduce((entries, folder) => {
    entries[folder] = `./integ/${folder}/index.ts`;
    return entries;
  }, {});
}
const getHtmlWebpackConfig = () => {
    const folders = getEntryPointsFromFolderStructure();
    return folders.map((entryName) => ({
    chunks: [entryName],
    filename: `${entryName}.html`,
    template: 'integ/index.html'
  }));
}

const merge = require('webpack-merge').merge;
const baseConfig = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(baseConfig, {
  entry: getEntries(),
  plugins: [
    ...getHtmlWebpackConfig().map(config => new HtmlWebpackPlugin(config)),
    // Extract all CSS
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
});
