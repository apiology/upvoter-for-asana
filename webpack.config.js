module.exports = {
  entry: ['./src/background.js', './src/upvoter.js'],
  output: {
    filename: 'background.js',
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
};
