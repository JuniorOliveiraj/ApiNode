
const mysql = require('mysql2');
require('dotenv').config();

// Configurações de conexão com o banco de dados
const connection = mysql.createConnection({
  host: process.env.CLOUD_BD,
  user:  process.env.USER_BD,
  password: process.env.PASSWORD_BD,
  database: process.env.BD_NAME,
  port: process.env.PORT, // Adicione esta linha para especificar a porta
  // ssl: {
  //   rejectUnauthorized: true
  // }
  
});



module.exports = connection;
