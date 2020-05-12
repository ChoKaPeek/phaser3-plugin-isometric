module.exports = {
  mode: 'production',
  entry: [
    './src/Phaser3Isometric.js'
  ],
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'phaser3-plugin-isometric.js',
    library: 'phaser3-plugin-isometric',
    libraryTarget: 'commonjs2'
  }
};

