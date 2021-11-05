// webpack.config.js
const path = require("path");
const slsw = require("serverless-webpack");

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  devtool: slsw.lib.webpack.isLocal
    ? "eval-cheap-module-source-map"
    : "source-map",
  target: "node",
  resolve: {
    extensions: [".mjs", ".ts", ".js", ".json", ".tsx"],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        use: "ts-loader",
        exclude: [[/node_modules/]],
      },
    ],
  },
};
