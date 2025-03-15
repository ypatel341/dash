const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// const CompressionPlugin = require('compression-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production', // Enable production optimizations like minification and tree-shaking
  entry: './src/index.tsx', // Change this if your entry point is different
  output: {
    filename: '[name].[contenthash].js', // Name for your bundled file
    path: path.resolve(__dirname, 'dist'), // Output directory for the bundle
    clean: true, // Clean the output directory before each build
  },
  // purge: ['./src/**/*.{js,jsx,ts,tsx}'], // Specify the paths to all of the template files in your project
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
              presets: [
                '@babel/preset-env',
                  // {
                  //   targets: '> 0.25%, not dead',
                  //   useBuiltIns: 'usage',
                  //   corejs: 3,
                  // },
                '@babel/preset-react', // Transpile JSX if using React
                
              ],
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
      minify: { collapseWhitespace: true}
    }),
    // new BundleAnalyzerPlugin(),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    usedExports: true,
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  performance: {
    hints: "warning",
    maxAssetSize: 250000
  },
  //   devServer: {
  //     contentBase: path.join(__dirname, 'dist'),
  //     compress: true,
  //     port: 9000,
  //     proxy: {
  //       '/api': 'http://localhost:5000',
  //     },
  //   },
};
