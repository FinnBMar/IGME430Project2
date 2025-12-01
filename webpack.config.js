const path = require('path');

module.exports = {
  entry: {
    app: './client/quest.jsx',     // was ./client/maker.jsx
    login: './client/login.jsx',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  mode: 'development',
  devtool: 'source-map',
  watchOptions: {
    aggregateTimeout: 200,
  },
  output: {
    path: path.resolve(__dirname, 'hosted'),
    filename: '[name]Bundle.js',  // appBundle.js and loginBundle.js
  },
};
