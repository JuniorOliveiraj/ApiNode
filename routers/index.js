const router = require("express").Router();
const connection = require('../models/bd');
const authController = require('../controller/authController');
const jwt = require('jsonwebtoken');

// const fazerRequisicaoLogin = require('../controller/login');
// const User = require('../models/usuarios'); 
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';
router.get('/', (req, res) => {
  //res.json({message:'api funcionando 2'})
  res.redirect('https://canaa.vercel.app');
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
    connection.end(); // Encerra a conexão em caso de erro na consulta
  });
});

function authenticateToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }

  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
    }
    
    // Token válido, passar para a próxima função
    next();
  });
}

router.get('/register', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
}, authController.register);
router.get('/login', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
}, authController.login);

router.get('/private', authenticateToken, authController.privateFunction);






module.exports = router;