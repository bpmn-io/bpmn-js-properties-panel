const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './demo/demo.js',
  output: {
    path: path.resolve(__dirname, '../demo'),
    filename: 'demo.bundle.js'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '../demo'),
    },
    compress: true,
    port: 9000,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              [ '@babel/plugin-transform-react-jsx', {
                'importSource': '@bpmn-io/properties-panel/preact',
                'runtime': 'automatic'
              } ]
            ]
          }
        }
      },
      {
        test: /\.bpmn$/,
        use: 'raw-loader'
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.svg$/,
        use: 'react-svg-loader'
      }
    ]
  },
  resolve: {
    alias: {
      'preact': '@bpmn-io/properties-panel/preact',
      'react': '@bpmn-io/properties-panel/preact/compat',
      'react-dom': '@bpmn-io/properties-panel/preact/compat'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {}
    })
  ],
  devtool: 'source-map'
};
