const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Suppress util._extend deprecation warning
process.noDeprecation = true;

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
// app.use(express.json()); // Removed to avoid conflict with proxy

// Service URLs - use environment variables for Docker/production
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';

console.log('Service URLs configured:');
console.log('AUTH:', AUTH_SERVICE_URL);
console.log('PRODUCT:', PRODUCT_SERVICE_URL);
console.log('ORDER:', ORDER_SERVICE_URL);

// Proxy endpoints
app.use('/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '',
    },
}));
app.use('/products', createProxyMiddleware({
    target: PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/products': '',
    },
}));
app.use('/orders', createProxyMiddleware({
    target: ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/orders': '',
    },
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running');
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
