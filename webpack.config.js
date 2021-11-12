const webpack = require('webpack');

module.exports = {
  entry: {
    background: ['./src/background.js', './src/upvoter.js'],
    'content-script': ['./src/content-script.js'],
  },
  output: {
    filename: '[name].js',
  },
  resolve: {
    fallback: {
      // asana library uses the node API and expects users to use
      // webpack to polyfill it when using BrowserJS
      //
      // https://webpack.js.org/configuration/resolve/
      fs: false, // not particularly used by asana
      url: require.resolve('url/'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  // https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
  devtool: 'cheap-module-source-map',
  plugins: [
    // asana uses process.env to look for a debug flag.  let's give it
    // something to look at.  the default polyfill recommended by
    // https://webpack.js.org/configuration/resolve/ didn't seem to
    // satisfy node-asana.
    new webpack.DefinePlugin({
      process: {
        env: '{}',
      },
    }),
  ],
};
