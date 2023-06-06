const connection = require('../models/bd');
const jwt = require('jsonwebtoken');

const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';

function register(req, res) {
  const name = req.query.name;
  const email = req.query.email;
  const password = req.query.password;

  // Verifique se todos os campos foram preenchidos
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }


  // Criptografe a senha do usuário antes de salvar no banco de dados
  const hashedPassword = password; // Modifique aqui para usar uma biblioteca de criptografia como bcrypt.js

  // Verifique se o email já está em uso
  connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    // Salve o usuário no banco de dados
    const user = { name, email, password: hashedPassword, company: 'convidado', status: 1, role: 'FullStack' };
    connection.query('INSERT INTO users SET ?', user, (err, result) => {
      if (err) {
        console.error('Erro ao inserir o usuário no banco de dados:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
      }

      const userId = result.insertId;

      // Gerar um token de autenticação usando a biblioteca JWT
      const token = jwt.sign({ user_id: userId }, key, { algorithm: 'HS256' });

      // Retornar o token como resposta
      return res.status(201).json({
        message: 'Usuário criado com sucesso.',
        token,
        user
      });
    });
  });
}
function login(req, res) {
  const email = req.query.email;
  const password = req.query.password;
  // Verificar se todas as credenciais foram fornecidas
  if (!email) {
    return res.status(401).json({ error: 'E-mail obrigatório.' });
  }
  if (!password) {
    return res.status(401).json({ error: 'Senha obrigatória.' });
  }
  // Verificar se as credenciais são válidas
  connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (results.length === 0) {
      // Caso o resultado da consulta seja vazio, significa que o e-mail é inválido
      return res.status(401).json({ error: 'email incorreto.' });
    }

    const user = results[0];

    if (user.password !== password) {
      // Caso a senha não corresponda à senha do usuário, retorna senha inválida
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    // Gerar um token de autenticação usando a biblioteca JWT
    const token = jwt.sign({ user_id: user.id }, key, { algorithm: 'HS256' });
    // Retornar o token como resposta
    return res.json({ token, user });
  });

}

function privateFunction(req, res) {
  // Verificar se o token de acesso foi fornecido
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }
  try {
    // Verificar se o token é válido e decodificar os dados do usuário
    const decoded = jwt.verify(token, key);
    // Aqui você pode realizar qualquer lógica que desejar
    // Retornar um JSON qualquer como resposta
    return res.status(200).json({ message: 'Função privada executada com sucesso.' });
  } catch (error) {
    // O token é inválido ou expirou
    return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
  }
}
const userList = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }
  try {
    // Verificar se o token é válido e decodificar os dados do usuário
    const decoded = jwt.verify(token, key);
    if (decoded) {


      connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
          console.error('Erro ao consultar o banco de dados:', err);
          return res.status(500).json({ error: 'Erro interno do servidor.' });
        }

        if (results.length > 0) {
          const usersAll = results.map(user => ({
            id: user.id,
            avatarUrl:user.avatarUrl,
            name: user.name,
            company: user.company,
            isVerified: true,
            status: user.status === 1 ? 'active': 'não' ,
            role:user.role  ,
          }));
          return res.status(200).json({ usersAll });
        } else {
          return res.status(500).json({ error: 'Erro interno do servidor. nada encontrado' });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Token de acesso expirado ou invalido' });
  }
}
module.exports = {
  register,
  login,
  privateFunction,
  userList
};
