const path = require('path');
const webpack = require('webpack');
process.noDeprecation = true;
const settings = {
  entry: {
    bundle: [
      "./src/main.js"
    ]
  },
  output: {
    filename: "[name].js",
    publicPath: "/",
    path: path.resolve("build")
  },
  resolve: {
    extensions: [".js", ".json", ".css"]
  },
	// devtool: 'eval',
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            ["es2015", { modules: 'commonjs' }],
            "stage-2",
            "react"
          ],
        }
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              sourceMap: false,
              importLoaders: 1,
              localIdentName: "[name]--[local]--[hash:base64:8]"
            }
          },
          "postcss-loader" // has separate config, see postcss.config.js nearby
        ]
      },
    ]
  },
  devServer: {
    contentBase: path.resolve("src/www"),
    publicPath: "http://localhost:8080/", // full URL is necessary for Hot Module Replacement if additional path will be added.
    quiet: false,
    hot: true,
    historyApiFallback: true,
    inline: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
  ],
};

module.exports = settings;