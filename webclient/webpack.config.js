"use strict";
var   webpack           = require('webpack');
var   path              = require('path');
var   loaders           = require('./webpack.loaders');
var   HtmlWebpackPlugin = require('html-webpack-plugin');
var   DashboardPlugin   = require('webpack-dashboard/plugin');
var   ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HOST              = process.env.HOST || "127.0.0.1";
const PORT              = process.env.PORT || "8888";

loaders.push({
  test   : /\.scss$/,
  loaders: ['style-loader', 'css-loader?importLoaders=1', 'sass-loader'],
  exclude: ['node_modules']
});
// loaders.push({
//   test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
//   loader: 'url-loader',
//   options: {
//     limit: 10000
//   }
// });
module.exports = {
  entry: [
    'react-hot-loader/patch',
    './src/index.jsx', // your app's entry point
  ],
  devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
  output : {
    publicPath: '/',
    path      : path.join(__dirname, 'public'),
    filename  : 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx','.ts', '.scss', '.css']
  },
  module: {
    rules: loaders
  },
  devServer: {
    contentBase: "./public",
    // do not print bundle build stats
    noInfo: true,
    // enable HMR
    hot: true,
    // embed the webpack-dev-server runtime into the bundle
    inline: true,
    // serve index.html in place of 404 responses to allow HTML5 history
    historyApiFallback: true,
    port              : PORT,
    host              : HOST
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      filename : 'style.css',
      allChunks: true
    }),
    new DashboardPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      files   : {
        css: ['style.css'],
        js : [ "bundle.js"],
      },
      favicon: './src/assets/images/logo.png'
    }),
    new Dotenv()
  ]
};
