
const mysql = require('mysql2');
require('dotenv').config();

// Configurações de conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'aws.connect.psdb.cloud',
  user: 'gwdkoj05746cfhnh74c2',
  password: process.env.PASSWORD_BD,
  database: 'bd-oliveira',
  ssl: {
    rejectUnauthorized: true
  }
});

module.exports = connection;
