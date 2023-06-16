const connection = require('../../models/bd'); // Importe a configuração de conexão com o banco de dados
const jwt = require('jsonwebtoken');
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';


const listaridNoticia = async (req, res) => {
  const { themastatus, authorization, id, } = req.headers;
  if (!authorization || !id ) {
    console.log(themastatus);
    return res.status(401).json({ error: 'Nenhum valor fornecido.', authorization, id, themastatus });
  }
  const decoded = jwt.verify(authorization, key);
  if (decoded) {
    const values = [id];
    const checkedId = `SELECT * FROM thema_dark WHERE id_user = ?`
    const result = await executeQuery(checkedId, values);

    if (result.length === 0) {
      const sqlInsert = "INSERT INTO thema_dark (id_user, thema) VALUES (?, ?)"
      const insertValues = [id, themastatus];
      await executeQuery(sqlInsert, insertValues);
      return res.status(200).json({ mensagem: 'Registro inserido com sucesso.',  themastatus:themastatus});
    } else {
      if(!themastatus){
        return res.status(200).json({ mensagem: 'vazio',themastatus:result[0].thema});
      }
      const sqlUpdate = "UPDATE thema_dark  SET thema = ? WHERE (id_user = ?)"
      const insertValues = [themastatus, id];
      await executeQuery(sqlUpdate, insertValues);
      return res.status(200).json({ mensagem: 'Registro já existe.',themastatus:themastatus});
    }
  }else{
    return res.status(404).json({ mensagem: 'não autorizado' });
  }

}


function executeQuery(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  listaridNoticia
}