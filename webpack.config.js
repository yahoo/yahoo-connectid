const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const WebpackDeleteAfterEmit = require('webpack-delete-after-emit');

module.exports = {
  entry: {
    connectid: './src/connectid.js',
    demo: './src/demo/demo.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devServer: {
    contentBase: './dist',
    hot: true,
    disableHostCheck: true,
    https: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'demo.html',
      chunks: ['demo'],
      template: './src/demo/demo.html',
      inlineSource: '.(js|css)$',
      minify: {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true
      }
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/\.(js)$/]),
    new WebpackDeleteAfterEmit({
      globs: [
        'demo.js'
      ]
    })
  ]
};
