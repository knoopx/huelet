const path = require('path')
const webpack = require('webpack')
const { productName, dependencies } = require('./package.json')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  target: 'electron-renderer',
  mode: process.env.NODE_ENV,
  entry: ['source-map-support/register', './src/index.css', './src/index.jsx'],
  plugins: [
    new webpack.ExternalsPlugin('commonjs', Object.keys(dependencies)),
    new ExtractTextPlugin({
      filename: 'renderer.css',
      disable: !isProduction,
    }),
    new HtmlWebpackPlugin({
      title: productName,
      filename: 'renderer.html',
      template: 'src/index.ejs',
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
  },
  resolve: {
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'postcss-loader',
          ],
        }),
        include: [path.resolve(__dirname, 'src')],
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: [
          path.resolve('./src'),
          path.resolve('./node_modules/react-icons'),
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
    ],
  },
}
