import express from 'express';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Configuración de CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Agregar middleware para parsear JSON ANTES del proxy
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url} - Headers:`, req.headers);
  if (req.body) {
    console.log('Request Body:', req.body);
  }
  next();
});

// Servir archivos estáticos
app.use(express.static('dist'));

// Configurar proxy para API
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {'^/api': ''},
  secure: false,
  ws: false,
  xfwd: true,
  onProxyReq: (proxyReq, req, res) => {
    // Si hay un body, asegurarse de que se envía correctamente
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // Escribir el body en la petición proxy
      proxyReq.write(bodyData);
      proxyReq.end();
    }
    
    console.log('Proxy Request:', {
      method: req.method,
      originalUrl: req.url,
      targetUrl: proxyReq.path,
      headers: proxyReq.getHeaders(),
      body: req.body
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Proxy Response:', {
      statusCode: proxyRes.statusCode,
      url: req.url,
      headers: proxyRes.headers
    });

    if (proxyRes.statusCode >= 400) {
      let body = '';
      proxyRes.on('data', chunk => body += chunk);
      proxyRes.on('end', () => {
        console.error('Error Response Body:', body);
      });
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body
    });
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message,
      path: req.url
    });
  }
}));

// Agregar middleware para parsear JSON antes del proxy
app.use(express.json());

// Agregar middleware para manejar errores generales
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Server Error',
    message: err.message
  });
});

// Configurar proxy para Socket.IO
app.use('/socket.io', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
  secure: false,
  xfwd: true
}));

// Manejar todas las rutas para SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) {
    next();
  } else {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  }
});

const PORT = process.env.PORT || 4173;
const server = createServer(app);

// Manejar errores del servidor
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Escuchar en todas las interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Preview server running on port ${PORT}`);
  console.log('Available on:');
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://127.0.0.1:${PORT}`);
  console.log(`  http://192.168.1.5:${PORT} (Local Network)`);
}); 