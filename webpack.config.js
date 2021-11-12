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
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      // https://github.com/webpack-contrib/css-loader/issues/447
      //
      // ERROR in ./node_modules/asana/lib/auth/index.js
      // Module not found: Error: Can't resolve './auto_detect' in
      //   '/Users/broz/src/upvoter_for_asana/node_modules/asana/lib/auth'
      // @ ./node_modules/asana/lib/auth/index.js 6:21-45
      // @ ./node_modules/asana/index.js
      // @ ./src/upvoter.js
      // @ multi ./src/background.js ./src/upvoter.js
      fs: false, // do not include a polyfill for fs
    },
  },
  output: {
    filename: '[name].js',
  },
  // https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
  devtool: 'cheap-module-source-map',
};
