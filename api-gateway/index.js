const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
// app.use(express.json()); // Removed to avoid conflict with proxy

// Service URLs (in production these would be env vars)
const AUTH_SERVICE_URL = 'http://localhost:5001';
const PRODUCT_SERVICE_URL = 'http://localhost:5002';
const ORDER_SERVICE_URL = 'http://localhost:5003';

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
