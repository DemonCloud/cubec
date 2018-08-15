const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './page/index.js',
  mode: 'development',
  // mode: 'production',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'c.webpack.min.js',
  },

  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name].js.map'
    })
  ],

  devServer: {
    compress: true,
    port: 9000,
  },

  devtool: 'cheap-source-map',
};
