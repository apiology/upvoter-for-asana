module.exports = {
  entry: {
    background: ['./src/background.ts', './src/upvoter.ts'],
    'content-script': ['./src/content-script.ts'],
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
  node: {
    // https://github.com/webpack-contrib/css-loader/issues/447
    //
    // ERROR in ./node_modules/asana/lib/auth/index.js
    // Module not found: Error: Can't resolve './auto_detect' in
    //   '/Users/broz/src/upvoter_for_asana/node_modules/asana/lib/auth'
    // @ ./node_modules/asana/lib/auth/index.js 6:21-45
    // @ ./node_modules/asana/index.js
    // @ ./src/upvoter.js
    // @ multi ./src/background.js ./src/upvoter.js
    fs: 'empty',
  },
  // 'inline-source-map' is suggested by https://webpack.js.org/guides/typescript/
  // 'cheap-module-source-map' is suggested by https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
  devtool: 'cheap-module-source-map',
};
