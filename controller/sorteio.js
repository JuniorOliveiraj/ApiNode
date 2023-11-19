const connection = require('../models/bd');
async function BuscarParticipantes(req, res) {
    // Verificar se o token de acesso foi fornecido

    try {
        const sql = 'select id, nome from Participantes ';
        const Participantes = await executeQuery(sql, []);
        return res.status(201).json({ dados: Participantes });

    } catch (error) {
        // O token é inválido ou expirou
        return res.status(401).json({ error: 'erro' });
    }
}
async function Verificar(req, res) {
    const { id, sorteado } = req.query;
        try {
        const sql = 'SELECT nome FROM Participantes WHERE id IN (?, ?)and view = 0';
        const Participantes = await executeQuery(sql, [id, sorteado]);
        return res.status(201).json({ dados: Participantes  });

    } catch (error) {
        // O token é inválido ou expirou
        return res.status(401).json({ error: 'erro' });
    }
}
async function updateSorteio(req, res) {
    const { id } = req.query;
        try {
        const sql = 'UPDATE Participantes SET view = 1 WHERE id = ?';
        const Participantes = await executeQuery(sql, [id]);
        return res.status(201).json({ dados: Participantes  });

    } catch (error) {
        // O token é inválido ou expirou
        return res.status(401).json({ error: 'erro' });
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

module.exports = {BuscarParticipantes, Verificar, updateSorteio}