const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'bundle.js' // 输出文件名
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // 处理 .js 和 .jsx 文件
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/, // 处理 CSS 文件
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'] // 支持文件扩展名
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML 模板文件
      filename: 'index.html'
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 9000, // 本地开发服务器端口
    open: true // 自动打开浏览器
  }
};
