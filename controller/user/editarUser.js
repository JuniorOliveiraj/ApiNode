



const connection = require('../../models/bd'); // Importe a configuração de conexão com o banco de dados
const jwt = require('jsonwebtoken');
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';

const updateuseradm = async (req, res) => {
    const { authorization } = req.headers;
    const { userSelct, userID, cargo } = req.query;
    if (!authorization) {
        console.log(themastatus);
        return res.status(401).json({ error: 'token de acesso não fornecido' });
    } if (!userSelct || !userID || !cargo) {
        return res.status(401).json({ error: 'nenhum usuario fornecido' });
    }
    const decoded = jwt.verify(authorization, key);
    if (decoded) {
        const checkeduser = 'SELECT * FROM Z_USUARIOS where id = ? '
        const user = await executeQuery(checkeduser, [userID]);
        if (user[0].permission_level  === 'ADM') {
            const sqlUpdate = 'UPDATE  Z_USUARIOS SET PAPEL = ? WHERE (id = ?)'
            const updateUser = await executeQuery(sqlUpdate, [cargo, userSelct])
            return res.status(200).json({ mensagem: 'ok', user });
        } else {
            return res.status(401).json({ error: 'sem permição' });
        }
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
    updateuseradm
}