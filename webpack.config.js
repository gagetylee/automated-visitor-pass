var path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      { test: /\.ts?$/, use: "ts-loader", exclude: /node_modules/ },
      { test: /\.json/, use: "json-loader", exclude: /node_modules/ },
      { test: /\.png/ },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  target: "node",
  node: {
    __dirname: true,
  },
  mode: "production",
  externals: [nodeExternals({ allowlist: ["playwright"] })],
};
