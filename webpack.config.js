// console.log("--- Using Local Webpack Config ---");
module.exports = {
    entry: "./src/index.js",
    // target: 'webworker',
    mode: "development",
    optimization: {
      minimize: false
    },
    performance: {
      hints: false
    },
    output: {
      path: __dirname + "/dist",
      publicPath: "dist",
      filename: "main.js"
    }
  };