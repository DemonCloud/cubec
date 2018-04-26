const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './page/index.js',
  // mode: 'development',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'c.webpack.min.js',
  },
  plugins: [new HtmlWebpackPlugin()],
  devServer: {
    compress: true,
    port: 9000,
  },

  // devtool: 'cheap-module-source-map',
};
