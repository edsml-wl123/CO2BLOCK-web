// created by Wenxin Li, github name wl123

// Set up proxy to handle cross-origin requests to backend
const { createProxyMiddleware } = require('http-proxy-middleware');
 
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',  // change the target to your backend address
      changeOrigin: true,
    //   pathRewrite: {
    //     '^/api': '/api',
    //   },
    })
  );
};