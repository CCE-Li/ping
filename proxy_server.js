const http = require('http');
const httpProxy = require('http-proxy');

// 创建代理服务器实例
const proxy = httpProxy.createProxyServer({});

// 创建HTTP服务器监听8081端口
const server = http.createServer((req, res) => {
  // 记录请求信息
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`  来源: ${req.headers.referer || '无'}`);
  console.log(`  用户代理: ${req.headers['user-agent']}`);
  console.log(`  请求头:`, JSON.stringify(req.headers, null, 2));
  
  // 检查URL是否以斜杠结尾
  if (req.url.endsWith('/') && req.url.includes('/api/categories/')) {
    console.log(`  ⚠️  警告: 检测到带尾斜杠的categories URL: ${req.url}`);
  }
  
  // 将请求代理到后端服务器
  proxy.web(req, res, {
    target: 'http://localhost:8000',
    changeOrigin: true
  });
});

// 监听代理服务器错误
proxy.on('error', (err, req, res) => {
  console.error('代理错误:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('代理服务器错误');
});

// 启动代理服务器
const PORT = 8081;
server.listen(PORT, () => {
  console.log(`代理服务器已启动，监听端口 ${PORT}`);
  console.log(`访问 http://localhost:${PORT} 来访问代理服务器`);
  console.log(`所有请求将被代理到 http://localhost:8000`);
});
