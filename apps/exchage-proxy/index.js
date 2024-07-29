import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv';
import cors from 'cors'
const app = express();
dotenv.config();

const PORT = 3000;

app.use(cors())


app.use((req, res, next) => {
    console.log("Reached middleware 1 : ");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
})

app.use('/', createProxyMiddleware({
    target: "https://api.backpack.exchange",
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(req)
    },
    onProxyRes: (proxyRes, req, res) => {

    }
    
}))

app.listen(PORT, () => {
    console.log(`Sserver running on http://localhost:${PORT}`);
})