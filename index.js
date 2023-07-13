const express = require("express");
const path = require("path");

const server = express();

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
