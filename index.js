const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require('http-proxy-middleware');

const server = express();
server.use(express.json());



server.use('/api', createProxyMiddleware({
  target: 'http://local.juniorbelem.com:3001', // Substitua pelo endereço e porta da sua API C#
  changeOrigin: true,

  onProxyReq: (proxyReq, req, res) => {
    // Você pode personalizar a requisição aqui, se necessário
  }
}));


server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

server.use(express.static(path.join(__dirname + "/public")));
server.use("/", require("./routers/index.js"));

server.listen(3001, () => {
  console.log("Servidor funcionando na porta 3001");
});
