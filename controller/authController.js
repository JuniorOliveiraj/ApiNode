const connection = require('../models/bd');
const jwt = require('jsonwebtoken');

const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';

function register(req, res) {
  const nome = req.query.name;
  const email = req.query.email;
  const senha = req.query.password;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const hashedPassword = senha; // Substitua por bcrypt se quiser segurança

  connection.query('SELECT * FROM Z_USUARIOS WHERE EMAIL = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    const user = {
      NOME: nome,
      EMAIL: email,
      SENHA: hashedPassword,
      PAPEL: 'convidado',
      STATUS: 1,
    };

    connection.query('INSERT INTO Z_USUARIOS SET ?', user, (err, result) => {
      if (err) {
        console.error('Erro ao inserir o usuário no banco de dados:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
      }

      const userId = result.insertId;
      const token = jwt.sign({ user_id: userId }, key, { algorithm: 'HS256' });

      return res.status(201).json({
        message: 'Usuário criado com sucesso.',
        token,
        userId,
        user,
      });
    });
  });
}

function login(req, res) {
  const email = req.query.email;
  const senha = req.query.password;

  if (!email || !senha) {
    return res.status(401).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  connection.query('SELECT * FROM Z_USUARIOS WHERE EMAIL = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email incorreto.' });
    }

    const user = results[0];

    if (user.SENHA !== senha) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    const token = jwt.sign({ user_id: user.ID }, key, { algorithm: 'HS256' });

    return res.json({ token, user });
  });
}

function privateFunction(req, res) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }
  try {
    const decoded = jwt.verify(token, key);
    return res.status(200).json({ message: 'Função privada executada com sucesso.' });
  } catch (error) {
    return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
  }
}

const userList = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, key);
    if (decoded) {
      connection.query('SELECT * FROM Z_USUARIOS', (err, results) => {
        if (err) {
          console.error('Erro ao consultar o banco de dados:', err);
          return res.status(500).json({ error: 'Erro interno do servidor.' });
        }

        const usersAll = results.map(user => ({
          id: user.ID,
          avatarUrl: user.FOTO,
          name: user.NOME,
          role: user.PAPEL,
          isVerified: true,
          status: user.STATUS === 1 ? 'active' : 'não',
        }));

        return res.status(200).json({ usersAll });
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Token de acesso expirado ou invalido' });
  }
};

function updateUser(req, res) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Token de autorização não fornecido' });

  const { userID, form, urlImg } = req.query;
  if (!userID || !form || !urlImg) {
    return res.status(500).json({ message: 'todos os dados devem ser mandados na requisição' });
  }

  const { email, displayName, role } = form;
  if (!email || !displayName || !role) {
    return res.status(500).json({ message: 'form vazio', form });
  }

  const decoded = jwt.verify(token, key);
  if (decoded) {
    let sql = `UPDATE Z_USUARIOS SET `;
    const columns = Object.keys(form).filter(key => form[key] !== undefined);
    sql += columns.map(column => {
      const newCol = column === 'displayName' ? 'NOME' : column.toUpperCase();
      return `${newCol} = ?`;
    }).join(', ');

    const values = columns.map(key => form[key]);
    sql += ' WHERE ID = ?';
    values.push(userID);

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao atualizar o usuário:', err);
        return res.status(500).json({ error: 'Erro ao atualizar o usuário' });
      }

      connection.query('SELECT * FROM Z_USUARIOS WHERE ID = ?', [userID], (error, result2) => {
        if (error) {
          return res.status(500).json({ message: 'Erro interno do servidor. Nada encontrado.' });
        } else {
          const row = result2[0];
          row.token = token;
          return res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: row });
        }
      });
    });
  }
}

const loaduser = async (req, res) => {
  const { authorization, id } = req.headers;
  if (!authorization || !id) {
    return res.status(500).json({ error: 'token não fornecido' });
  }

  try {
    const decoded = jwt.verify(authorization, key);
    if (decoded) {
      connection.query('SELECT * FROM Z_USUARIOS WHERE ID = ?', [id], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Erro interno do servidor.' });
        }

        if (results.length > 0) {
          return res.status(200).json({ user: results, token: authorization });
        } else {
          return res.status(500).json({ error: 'Erro interno do servidor. nada encontrado' });
        }
      });
    }
  } catch (error) {
    return res.status(401).json({ error: 'usuário não autorizado' });
  }
};

module.exports = {
  register,
  login,
  privateFunction,
  userList,
  updateUser,
  loaduser
};
