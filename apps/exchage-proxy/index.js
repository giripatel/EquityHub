import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv';

const app = express();
dotenv.config();

const PORT = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    console.log(process.env.TARGET_URL)
    next();
})

app.use('/', createProxyMiddleware({
    target: "https://api.backpack.exchange",
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {

    },
    onProxyRes: (proxyRes, req, res) => {

    }
}))

app.listen(PORT, () => {
    console.log(`Sserver running on http://lcoalhost:${PORT}`);
})