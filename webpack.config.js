// Import Node modules
const path = require('path');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Configure WebPack
module.exports = {
  // Set entry point
  entry: './demo.js',

  // Configure WebPack for proper THREE JS compilation
  mode: 'production',
  devtool: 'source-map',
  
  // Configure Output
  output: {
    filename: 'demo.build.js',
    path: path.resolve(__dirname, 'build'),
  },
  
  // Configure file loader
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|mp4)$/,
        use: [
         {
            loader: "file-loader"
         }
        ]
      }
    ]
  },
  
  // Allow all of THREE JS to be compiled into final package
  performance: {
      maxEntrypointSize: 102400,
      maxAssetSize: 102400
  },
  
  // Prevent minification for faster builds
  optimization: {
    minimize: false
  },
  
  // Use WebPack plugins
  plugins: [
    // Clean build folder
    new CleanWebpackPlugin(),
    // Create index.html
    new HtmlWebpackPlugin({
      title: "THREE Video Player Object Demo",
      filename: path.resolve(__dirname, "build/index.html"),
      minify: false
    })
  ]
};