const connection = require('../../models/bd'); // Importe a configuração de conexão com o banco de dados


const SaldoEmConta = async (req, res) => {
    const QUERY = `
        SELECT 
        DATE_FORMAT(CURDATE(), '%Y-%m') AS 'Mes', 
        SUM(valor) AS 'Total'
        FROM 
            gastos_mensais_notion
        WHERE
        YEAR(data) = YEAR(CURDATE()) AND 
        MONTH(data) = MONTH(CURDATE());`;
    query2 =  `
        SELECT 
        SUM(CASE WHEN DAYOFWEEK(data) = 1 THEN valor ELSE 0 END) AS Domingo,
        SUM(CASE WHEN DAYOFWEEK(data) = 2 THEN valor ELSE 0 END) AS Segunda_feira,
        SUM(CASE WHEN DAYOFWEEK(data) = 3 THEN valor ELSE 0 END) AS Terca_feira,
        SUM(CASE WHEN DAYOFWEEK(data) = 4 THEN valor ELSE 0 END) AS Quarta_feira,
        SUM(CASE WHEN DAYOFWEEK(data) = 5 THEN valor ELSE 0 END) AS Quinta_feira,
        SUM(CASE WHEN DAYOFWEEK(data) = 6 THEN valor ELSE 0 END) AS Sexta_feira,
        SUM(CASE WHEN DAYOFWEEK(data) = 7 THEN valor ELSE 0 END) AS Sabado

        FROM 
            gastos_mensais_notion
        WHERE
            YEARWEEK(data, 1) = YEARWEEK(CURDATE(), 1);
    `;
    const result = await executeQuery(QUERY, []);
    const result2 = await executeQuery(query2, []);
    if (result && result2) {
        const chartValues = Object.values(result2[0]);
        return res.status(200).json({ mensagem: 'ok', values:result, charts:chartValues });
    } else {
        return res.status(401).json({ error: 'sem dados na query ou erro interno' });
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
    SaldoEmConta
}