const path = require('path');
const webpack = require('webpack');
const mockApp = require('./mock');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './test/index.js',
  mode: 'development',
  // mode: 'production',

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.min.js',
  },

  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name].js.map'
    })
  ],

  devServer: {
    compress: true,
    port: 9006,
    before : mockApp,
  },

  devtool: 'inline-cheap-source-map',
};
