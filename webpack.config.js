const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production', // Enable production optimizations like minification and tree-shaking
  entry: './src/index.tsx', // Change this if your entry point is different
  output: {
    filename: '[name].[contenthash].js', // Name for your bundled file
    path: path.resolve(__dirname, 'dist'), // Output directory for the bundle
    clean: true, // Clean the output directory before each build
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules|dbdump/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            },
          },
          'ts-loader', // Compile TypeScript files
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules|dbdump/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: { collapseWhitespace: true },
    }),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    usedExports: true,
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 250000,
  },
};
