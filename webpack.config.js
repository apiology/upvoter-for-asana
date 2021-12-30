// webpack requires a 'require' here, which seems reasonable as it's,
// you know, the thing that provides import to begin with:
//
// SyntaxError: Cannot use import statement outside a module
const CopyPlugin = require('copy-webpack-plugin'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  entry: {
    background: ['./src/background.ts', './src/upvoter-for-asana.ts'],
  },
  // https://webpack.js.org/guides/typescript/
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  // without this, I can't satisfy emacs TIDE's need for import lines to exclude
  // the .ts suffix, as it calls into tsc without webpack preprocessing.
  //
  // https://stackoverflow.com/questions/43595555/webpack-cant-resolve-typescript-modules
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  mode: 'development', // override with webpack --mode=production on CLI builds
  output: {
    filename: '[name].js',
  },
  // 'inline-source-map' is suggested by https://webpack.js.org/guides/typescript/
  // 'cheap-module-source-map' is suggested by https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
  devtool: 'cheap-module-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'static' }],
    }),
  ],
};
