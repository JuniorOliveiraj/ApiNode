const express = require("express");
const server = express();

server.use('/', require('./routers/index.js'))
server.listen(3001, ()=>{
    console.log('funcionando 2 ');
})