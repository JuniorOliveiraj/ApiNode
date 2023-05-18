// const Sequelize = require('sequelize');
// const sequelize = new Sequelize("bd-oliveira", "gwdkoj05746cfhnh74c2", "pscale_pw_x9A6wchx4HtQTk0IOcfEazSLIB1hGV4aPqbqPl1cmJJ", {
//     host: "aws.connect.psdb.cloud",
//     dialect: "mysql",
//     ssl: true,
//     dialectOptions: {
//       ssl: 'Amazon RDS',
//       rejectUnauthorized: false
//     }
//   });
  

// sequelize.authenticate().then(function(){
//     console.log("sucesso ao se conectar");
// }).catch(function(err){
//     console.log("erro ao conectar", err);
// });

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
