const { merge } = require("webpack-merge");
const CopyPlugin = require("copy-webpack-plugin");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  // output: {
  //   // Tweak this to match your GitHub project name
  //   publicPath: "/",
  // },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "assets", to: "" }],
    }),
  ],
});
