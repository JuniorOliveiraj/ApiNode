const connection = require('../../../models/bd');
const jwt = require('jsonwebtoken');
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';
const moment = require('moment');


async function  balanceCard(req, res) {
    const { userID, dataAtual } = req.query;
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso não fornecido.' });
    }
    // Dados recebidos da requisição GET
    const decoded = jwt.verify(token, key);
    // Dados recebidos da requisição GET
    if (!userID) {
        return res.status(501).json({ message: 'Nenhum id entregue.' });
    }
    if (decoded) {

        const blogQuery = `
        SELECT c.id, 
        SUM(g.compra_valor) as balance,
        c.cardType,
        u.displayName as cardHolder,
        c.cardNumber,
        c.cardValid
        
        FROM users u
        JOIN cards c ON u.id = c.id_user
        JOIN compras_cartao g ON c.id = g.id_card
        WHERE u.id = 9 and c.id=1`
        const blogValues = [];
        const blogResult = await executeQuery(blogQuery, blogValues);
        return res.status(200).json({ message: 'sucesso conexão', cardBalance:blogResult});
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
module.exports = { balanceCard };
