const express = require("express");
const server = express();

server.use('/', require('./routers/index.js'))
server.listen(3001, ()=>{
    console.log('funcionando 2 ');
})

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
  });