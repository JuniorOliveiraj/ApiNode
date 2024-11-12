const connection = require('../../models/bd'); // Importe a configuração de conexão com o banco de dados


const GastosTotais = async (req, res) => {
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
    SUM(CASE 
        WHEN WEEK(data, 1) - WEEK(DATE_SUB(data, INTERVAL DAY(data) - 1 DAY), 1) + 1 = 1 THEN valor 
        ELSE 0 
    END) AS Semana_1,
    SUM(CASE 
        WHEN WEEK(data, 1) - WEEK(DATE_SUB(data, INTERVAL DAY(data) - 1 DAY), 1) + 1 = 2 THEN valor 
        ELSE 0 
    END) AS Semana_2,
    SUM(CASE 
        WHEN WEEK(data, 1) - WEEK(DATE_SUB(data, INTERVAL DAY(data) - 1 DAY), 1) + 1 = 3 THEN valor 
        ELSE 0 
    END) AS Semana_3,
    SUM(CASE 
        WHEN WEEK(data, 1) - WEEK(DATE_SUB(data, INTERVAL DAY(data) - 1 DAY), 1) + 1 = 4 THEN valor 
        ELSE 0 
    END) AS Semana_4
FROM 
    gastos_mensais_notion
WHERE
    MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE());
    `;
    const result = await executeQuery(QUERY, []);
    const result2 = await executeQuery(query2, []);
    if (result && result2) {
        const chartValues = Object.values(result2[0]);
        const chartKeys = Object.keys(result2[0]);
        return res.status(200).json({ mensagem: 'ok', values:result, charts:chartValues, week:chartKeys });
    } else {
        return res.status(401).json({ error: 'sem dados na query ou erro interno' });
    }
}




const SaldoEmConta = async (req, res) => {
    const QUERY = `
        SELECT
            SUM(notion_property_conta) AS 'Total'
            FROM
                saldo_conta_notion
            WHERE
            YEAR(notion_data) = YEAR(CURDATE()) AND
            MONTH(notion_data) = MONTH(CURDATE());`;
    query2 =  `
        SELECT 
        SUM(CASE WHEN DAYOFWEEK(notion_data) = 2 THEN notion_property_conta ELSE 0 END) AS Segunda_feira,
        SUM(CASE WHEN DAYOFWEEK(notion_data) = 3 THEN notion_property_conta ELSE 0 END) AS Terca_feira,
        SUM(CASE WHEN DAYOFWEEK(notion_data) = 4 THEN notion_property_conta ELSE 0 END) AS Quarta_feira,
        SUM(CASE WHEN DAYOFWEEK(notion_data) = 5 THEN notion_property_conta ELSE 0 END) AS Quinta_feira,
        SUM(CASE WHEN DAYOFWEEK(notion_data) = 6 THEN notion_property_conta ELSE 0 END) AS Sexta_feira,
        SUM(CASE WHEN DAYOFWEEK(notion_data) = 7 THEN notion_property_conta ELSE 0 END) AS Sabado,
        SUM(CASE WHEN DAYOFWEEK(notion_data) = 1 THEN notion_property_conta ELSE 0 END) AS Domingo

        FROM 
            saldo_conta_notion
        WHERE
            YEARWEEK(notion_data, 1) = YEARWEEK(CURDATE(), 1);
    `;
    const result = await executeQuery(QUERY, []);
    const result2 = await executeQuery(query2, []);
    if (result && result2) {
        const chartValues = Object.values(result2[0]);
        const chartKeys = Object.keys(result2[0]);
        return res.status(200).json({ mensagem: 'ok', values:result, charts:chartValues, week:chartKeys });
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
    SaldoEmConta,
    GastosTotais
}