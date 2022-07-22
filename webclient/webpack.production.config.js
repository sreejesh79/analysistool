var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
const Dotenv = require('dotenv-webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var publicPath = path.join(__dirname, 'public');

loaders.push({
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract({fallback: 'style-loader', use : 'css-loader?sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded'}),
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
    './src/index.jsx'
  ],
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'public'),
    filename: '[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx','.ts', '.scss', '.css']
  },
  module: {
    loaders
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        drop_console: true,
        drop_debugger: true
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin({
      filename: 'style.css',
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      files: {
        css: ['style.css'],
        js: ['bundle.js'],
      },
      favicon: './src/assets/images/logo.png'
    }),
    new CopyWebpackPlugin([{
      from: './src/assets/images',
      to: publicPath
  }]),
    new Dotenv({
      path: "./.env.production"
    })
  ]
};
