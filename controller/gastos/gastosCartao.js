const connection = require('../../models/bd');
const jwt = require('jsonwebtoken');
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';
const moment = require('moment');


async function FaturaCaro(req, res) {
    const { gastos, userID } = req.query;
    if (!gastos || typeof gastos !== 'string' || gastos.trim() === '') {
        return res.status(501).json({ message: 'Nenhum dado entregue.' });
    }

    const regex = /💳(.*?)\nData: (\d{2}\/\d{2}\/\d{4}) às (\d{2}:\d{2})\nValor: R\$ ([\d,]+) à vista\nStatus: (\w+)/g;

    const compras = [];
    let match;

    while ((match = regex.exec(gastos))) {
        const [_, nome, data, hora, valor, status] = match;
        compras.push({ nome, data, hora, valor, status });
    }

    if (compras.length === 0) {
        return res.status(501).json({ message: 'Nenhum dado de compra encontrado.' });
    }

    const sqlCheck = 'SELECT * FROM compras_cartao WHERE compra_nome = ? AND compra_data = ? AND compra_hora = ? AND compra_valor = ? AND id_user = ?';
    const sqlInsert = 'INSERT INTO compras_cartao (compra_nome, compra_data, compra_hora, compra_valor, compra_status, id_user) VALUES (?, ?, ?, ?, ?, ?)';

    try {
        for (const compra of compras) {
            const statusValue = (compra.status === 'confirmada' || compra.status === 'aprovada') ? 1 : 0;
            const dataFormatted = moment(compra.data, 'DD/MM/YYYY').format('YYYY-MM-DD');
            const valorFormatted = compra.valor.replace(',', '.');

            const valuesCheck = [compra.nome, dataFormatted, compra.hora, valorFormatted, userID];
            const result = await executeQuery(sqlCheck, valuesCheck);

            if (result.length === 0) {
                const valuesInsert = [compra.nome, dataFormatted, compra.hora, valorFormatted, statusValue, userID];
                await executeQuery(sqlInsert, valuesInsert);
                console.log('Dados salvos com sucesso.');
            } else {
                console.log('Compra já existente, ignorando inserção.');
            }
        }

        return res.status(201).json({ message: 'Dados salvos com sucesso.' });
    } catch (error) {
        console.error('Erro ao inserir os dados no banco de dados:', error);
        return res.status(501).json({ message: 'Erro ao inserir os dados no banco de dados.' });
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



function buscarGastosUsuario(req, res) {
    const { userID } = req.query;
    if (!userID) {
        return res.status(501).json({ message: 'Nenhum id entregue.' });
    }
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso não fornecido.' });
    }
    // Dados recebidos da requisição GET
    const decoded = jwt.verify(token, key);
    const sql = 'SELECT * FROM compras_cartao WHERE id_user = ? AND compra_status = 1 ORDER BY compra_data';
  
    connection.query(sql, [userID], (err, result) => {
      if (err) {
        console.error('Erro ao buscar os gastos no banco de dados:', err);
        return res.status(500).json({ message: 'Erro ao buscar os gastos.' });
      }
  
      const gastos = result;
      const valorTotal = gastos.reduce((total, compra) => total + parseFloat(compra.compra_valor), 0);
  
      return res.status(200).json({ gastos, valorTotal });
    });
  }
module.exports = { FaturaCaro, buscarGastosUsuario };
