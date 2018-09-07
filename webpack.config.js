const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './page/index.js',
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
    filename: 'cubec.webpack.min.js',
  },

  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name].js.map'
    })
  ],

  devServer: {
    compress: true,
    port: 9001,
  },

  devtool: 'inline-cheap-source-map',
};
