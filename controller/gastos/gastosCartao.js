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
    const regex2 = /💳(.*?)\n\*Data\*\: (\d{2}\/\d{2}\/\d{4}) às (\d{2}:\d{2})\n\*Valor\*\: R\$ ([\d,]+) à vista\n\*Status\*\: (\w+)/g;
    const regex3 = /💳 (.*?)\n(?:estabelecimento: (.*(?:\n|$)))?\s*data: (\d{2}\/\d{2}\/\d{4}) às (\d{2}:\d{2})\nvalor:R\$ ([\d,]+) à vista/g;

    const compras = [];
    let match;

    while ((match = regex.exec(gastos))) {
        const [_, nome, data, hora, valor, status] = match;
        compras.push({ nome, data, hora, valor, status });
    }

    if (compras.length === 0) {
        while ((match = regex2.exec(gastos))) {
            const [_, nome, data, hora, valor, status] = match;
            compras.push({ nome, data, hora, valor, status });
        }
    }
    if (compras.length === 0) {
        while ((match = regex3.exec(gastos))) {
            const [_, nome2, estabelecimento, data2, hora2, valor2] = match;
            compras.push({ nome: nome2, estabelecimento, data: data2, hora: hora2, valor: valor2, status: 'confirmada' });
        }
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





function buscarGastosUsuario(req, res) {
    const { userID, dataAtual } = req.query;
    if (!userID) {
        return res.status(501).json({ message: 'Nenhum id entregue.' });
    }

    const data = new Date(); // Aqui você substituirá pela sua data
    const mes = moment(data).month() + 1; // +1 porque os meses em Moment.js são baseados em zero
    console.log(mes)



    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso não fornecido.' });
    }
    // Dados recebidos da requisição GET
    const decoded = jwt.verify(token, key);
    const sql = 'SELECT * FROM compras_cartao WHERE id_user = ? AND compra_status = 1 AND MONTH(compra_data) = ? ORDER BY compra_data DESC';

    connection.query(sql, [userID, mes], (err, result) => {
        if (err) {
            console.error('Erro ao buscar os gastos no banco de dados:', err);
            return res.status(500).json({ message: 'Erro ao buscar os gastos.' });
        }

        const gastos = result;
        const valorTotal = gastos.reduce((total, compra) => total + parseFloat(compra.compra_valor), 0);

        return res.status(200).json({ gastos, valorTotal });
    });
}



function adicionargastosmanual(req, res) {
    const { userID, compra } = req.query;
    if (!userID) {
        return res.status(501).json({ message: 'Nenhum id entregue.' });
    }
    const { nome, status, valor } = compra
    const dataAtual = new Date();
    const dataFormatted = moment(dataAtual).format('YYYY-MM-DD');
    const horaFormatted = moment(dataAtual).format('HH:mm:ss');
    const valorFormatted = valor.replace(',', '.');


    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso não fornecido.' });
    }
    // Dados recebidos da requisição GET
    const decoded = jwt.verify(token, key);
    if (decoded) {

        const sql = 'INSERT INTO compras_cartao (compra_nome, compra_data, compra_hora, compra_valor, compra_status, id_user) VALUES (?, ?, ?, ?, ?, ?)';
        const valuesInsert = [nome, dataFormatted, horaFormatted, valorFormatted, status, userID];
        connection.query(sql, valuesInsert, (err, result) => {
            if (err) {
                console.error('Erro ao guardar dados', err);
                return res.status(500).json({ message: 'Erro ao buscar os gastos.' });
            }
            return res.status(200).json({ message: 'dados guardados com sucesso' });
        });
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
module.exports = { FaturaCaro, buscarGastosUsuario, adicionargastosmanual };
