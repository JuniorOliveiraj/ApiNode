const router = require("express").Router();
const connection =require('../models/bd')
// const fazerRequisicaoLogin = require('../controller/login');
// const User = require('../models/usuarios'); 
router.get('/', (req, res) =>{
    res.json({message:'api funcionando 2'})
});
router.get('/users', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permite que qualquer origem acesse essa rota
  res.setHeader('Access-Control-Allow-Methods', 'GET'); // Define quais métodos HTTP são permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Define quais headers personalizados são permitidos

  connection.query('SELECT * FROM users', (error, results) => {
    if (error) {
      console.error('Erro ao executar a consulta:', error);
      res.status(500).json({ error: 'Erro ao recuperar usuários.' });
      connection.end(); // Encerra a conexão em caso de erro na consulta
      return;
    }

    res.json(results);
  });
});

// async function realizarLogin() {
//   const email = 'teste@tes.com';
//   const password = '123';

//   try {
//     const response = await fazerRequisicaoLogin(email, password);
//     //console.log('Resposta da API:', response);
//     return response; 
//   } catch (error) {
//     console.error('Erro!:', error);
//   }
// }

// router.get('/login', async (req, res) => {
//     try {
//       const response = await realizarLogin();
//       res.json(response); // Retorna o JSON como resposta para o cliente
//     } catch (error) {
//       res.status(500).json({ error: 'Erro na requisição' });
//     }
//   });


  // router.get('/users', async (req, res) => {
  //   try {
  //     const users = await User.findAll(); // Recupera todos os usuários do banco de dados
  
  //     res.json(users); // Retorna os usuários como resposta em formato JSON
  //   } catch (error) {
  //     console.error('Erro ao obter usuários:', error);
  //     res.status(500).json({ error: 'Erro ao obter usuários' });
  //   }
  // });

module.exports = router;