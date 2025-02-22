const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production', // Enable production optimizations like minification and tree-shaking
  entry: './src/index.tsx', // Change this if your entry point is different
  output: {
    filename: 'bundle.js', // Name for your bundled file
    path: path.resolve(__dirname, 'dist'), // Output directory for the bundle
  },
  resolve: {
    // Automatically resolve these extensions
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Matches both .ts and .tsx files
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env', // Transpile modern JS features
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
        exclude: /node_modules/,
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: './public/index.html',
    }),
  ],
//   devServer: {
//     contentBase: path.join(__dirname, 'dist'),
//     compress: true,
//     port: 9000,
//     proxy: {
//       '/api': 'http://localhost:5000',
//     },
//   },
  mode: 'production',
};
