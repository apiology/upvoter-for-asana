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
      // asana library uses the node API and expects users to use
      // webpack to polyfill it when using BrowserJS
      fs: false, // not particularly used by asana
      url: require.resolve('url/'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  output: {
    filename: '[name].js',
  },
  // https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
  devtool: 'cheap-module-source-map',
};
