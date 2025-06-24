const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    popup: './src/popup.ts',
    content: './src/content.ts',
    background: './src/background.ts',
    sidebar: './src/sidebar.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/popup.html', to: 'popup.html' },
        { from: 'src/sidebar.html', to: 'sidebar.html' },
        { from: 'manifest.json', to: 'manifest.json' }
      ]
    })
  ]
};
