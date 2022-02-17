const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const custom = require('../webpack.common');

module.exports = {
  stories: [
    "../storybook/**/*.stories.mdx",
    "../integ/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-storysource",
  ],
  core : { builder: 'webpack5'},
  webpackFinal: async (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          ...custom.module.rules,
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
              plugins: [
                [ "istanbul", { "useInlineSourceMaps": false } ]
              ]
            }
          }
        ]
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          ...custom.resolve.alias
        }
      },
      plugins: [
        ...config.plugins,
        new MiniCssExtractPlugin()
      ],
      // This is because of a limitation in ts-loader
      // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalse
      ignoreWarnings: [/export .* was not found in/]
    };
  }
}