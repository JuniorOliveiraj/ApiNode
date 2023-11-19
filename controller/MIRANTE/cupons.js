const connection = require("../../models/bd")
const axios = require('axios');

async function fetchData(req, res) {
    try {
        // Faça a requisição à API do cliente
        const response = await axios.get('https://lojamirante.com.br/api/getCouponUse?codigo=CupomP5,MIRANTE5,VOLTA5,carrinho5,presenteespecial,duda10,duda,figueredo10,FG7,vinicius10,VINI,emfoco10,EMFOCO	');

        // Verifique se a resposta contém dados
        if (response.data && Array.isArray(response.data)) {
            // Itere sobre os objetos no array
            for (const cupom of response.data) {
                const { Código, quantidade } = cupom;

                // Converta a quantidade para um número (se necessário)
                const quantidadeInt = parseInt(quantidade, 10);

                // Salve os dados no banco de dados
                const currentDate = new Date().toISOString().split('T')[0];
                const sql = 'INSERT INTO Mirante_cupons (nome, usus, data_por_dia, semana_do_ano, mes_do_ano, status) VALUES (?, ?, ?, WEEK(?), MONTH(?), ativo)';
                await executeQuery(sql, [Código, quantidadeInt, currentDate, currentDate, currentDate]);
            }

            console.log('Dados atualizados com sucesso!');
            return res.status(200).json({ mensagem: 'Dados atualizados com sucesso!', });
        } else {
            console.error('Resposta da API não está no formato esperado.');
        }
    } catch (error) {
        console.error('Erro ao atualizar os dados:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar os dados:' });
    }
}




async function ListCupons(req, res) {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const sql = "select id, nome , data_por_dia as 'date' ,  usus as amount, status   from  Mirante_cupons where data_por_dia >= ? ORDER BY amount DESC";
        const data = await executeQuery(sql, [currentDate]);

        return res.status(200).json({ mensagem: 'sucesso', dados: data });
    } catch (error) {
        console.error('Erro ao atualizar os dados:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar os dados:' });
    }
}


async function ChartCupons(req, res) {
    try {
        const { names, formato } = req.query;

        let sql = "";
        let groupByField = "";

        switch (formato.toLowerCase()) {
            case 'day':
                groupByField = 'DATE_FORMAT(data_por_dia, "%d-%m-%Y")';
                break;
            case 'week':
                groupByField = 'semana_do_ano';
                break;
            case 'month':
                groupByField = 'mes_do_ano';
                break;
            default:
                return res.status(400).json({ error: 'Formato inválido. Escolha entre Week, Month ou Day.' });
        }

        if (!Array.isArray(names) || names.length === 0) {
            return res.status(400).json({ error: 'Nomes inválidos. Forneça uma array de nomes.' });
        }

        const placeholders = names.map(() => '?').join(', ');

        sql = `SELECT ${groupByField} AS time_period, nome, SUM(usus) AS total_usus
             FROM Mirante_cupons
             WHERE nome IN (${placeholders})
             GROUP BY ${groupByField}, nome;`;

        // Aqui você precisa substituir os placeholders pelos valores reais dos nomes
        const values = [...names];

        // Execute a consulta SQL
        const dados = await executeQuery(sql, values);

        // Transforme os dados para o formato desejado
        const formattedData = formatChartData(dados, formato);

        return res.status(200).json({ mensagem: 'sucesso', data: formattedData, formato: formato });

    } catch (error) {
        console.error('Erro ao obter os dados:', error.message);
        res.status(500).json({ error: 'Erro ao obter os dados.' });
    }
}



function formatChartData(data, formato) {
    const formattedData = [];

    // Agrupar os dados pelo nome
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.nome]) {
            acc[item.nome] = [];
        }
        acc[item.nome].push({ day: item.day, total_usus: parseFloat(item.total_usus), TimeLine: item.time_period });
        return acc;
    }, {});

    // Criar o formato desejado
    const dataArray = Object.entries(groupedData).map(([nome, entries]) => ({
        name: nome,
        data: entries.map(entry => entry.total_usus),
    }));

    formattedData.push({
        TimeLine: Object.values(groupedData)[0].map(entry => entry.TimeLine),
        data: dataArray,
    });


    return formattedData;
}



async function ListCuponsNames(req, res) {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const sql = "SELECT DISTINCT nome FROM Mirante_cupons";
        const data = await executeQuery(sql, [currentDate]);
        const dadosFormatados = data.map(resultado => resultado.nome);

        return res.status(200).json({ mensagem: 'sucesso', dados: dadosFormatados });
    } catch (error) {
        console.error('Erro ao atualizar os dados:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar os dados:' });
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


module.exports = { fetchData, ListCupons, ChartCupons, ListCuponsNames }