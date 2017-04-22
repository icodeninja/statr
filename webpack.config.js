const path = require('path');
const webpack = require('webpack');
process.noDeprecation = true;
const exclude = /node_modules/;
const include = [
  path.resolve('./node_modules/react-toolbox'),
  path.resolve('src')
];
const prod = process.env.NODE_ENV === 'production';
const cssLoaderOptions = {
  loader: "css-loader",
  options: {
    modules: true,
    sourceMap: !prod,
    importLoaders: 1,
    localIdentName: prod ? "[hash:base64:4]" : "[name]_[hash:base64:8]"
  }
};
const settings = {
  entry: {
    bundle: [
      "./src/main.js"
    ]
  },
  output: {
    filename: "[name].js",
    publicPath: "/",
    path: path.resolve("dist/app/js")
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude,
        include,
        options: {
          comments: !prod,
          cacheDirectory: !prod,
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
          cssLoaderOptions,
          "postcss-loader"
        ]
      },
      {
        test: /(\.scss|\.sass)$/,
        exclude,
        include,
        use: [
          "style-loader",
          cssLoaderOptions,
          "postcss-loader",
          "sass-loader"
        ]
      }
    ]
  },
  // devServer: {
  //   contentBase: path.resolve("src/www"),
  //   publicPath: "http://localhost:8080/", // full URL is necessary for Hot Module Replacement if additional path will be added.
  //   quiet: false,
  //   hot: true,
  //   historyApiFallback: true,
  //   inline: true
  // },
  plugins: prod ? [
    new webpack.optimize.UglifyJsPlugin({
        comments: !prod,
        compress: {
          warnings: !prod,
          drop_console: prod
        }
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ] : [new webpack.NamedModulesPlugin()],
};

if(!prod){
  settings.devtool = 'eval';
}

module.exports = settings;