const connection = require('../../../models/bd');

async function PegarDadosMercadoPadoJsonPadrao(req, res) {
    const data = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(501).json({ message: 'Nenhum dado entregue ou formato inválido.' });
    }

    const valoresParaInserir = [];

    // Iterar pelos dados recebidos
    for (const compra of data) {
        let { nome, amount, description, origin, date, imageUrl } = compra;

        // Verificação de nome não vazio ou nulo
        if (!nome || nome.trim() === '') {
            console.log('Nome inválido ou ausente:', compra);
            continue; // Pular esta iteração se o nome for inválido
        }

        // Garantir que o valor 'amount' seja numérico e com ponto no lugar da vírgula
        if (amount) {
            amount = amount.replace(',', '.'); // Substituir vírgula por ponto
            amount = parseFloat(amount); // Converter para número
            if (isNaN(amount)) {
                console.log('Valor de amount inválido:', compra);
                continue; // Pular se amount não for um número válido
            }
        }

        // Gerar UUID para o ID
        const id = generateUUID();

        // Verificar se o item já existe no banco
        const verificarQuery = `
            SELECT COUNT(*) AS total 
            FROM gastos_mensais_notion
            WHERE name = ? AND valor like ? AND descricao = ? AND data = ?;
        `;
        const verificarValores = [nome, amount, description, date];
        const resultadoVerificacao = await executeQuery(verificarQuery, verificarValores);
        console.log(resultadoVerificacao)

        // Se não existir o registro, adicionar à lista de inserção
        if (resultadoVerificacao && resultadoVerificacao[0] && resultadoVerificacao[0].total === 0) {
            valoresParaInserir.push([ nome, amount, amount, description, date, imageUrl, origin]);
        }
    }

    // Inserir os dados se houverem novos
    if (valoresParaInserir.length > 0) {
        const insertQuery = `
            INSERT INTO gastos_mensais_notion 
            ( name, gasto_esse_mes, valor, descricao, data, avatarImage, conta_origem) 
            VALUES ?
        `;
        const insertResult = await executeQuery(insertQuery, [valoresParaInserir]);

        if (insertResult) {
            return res.status(200).json({ mensagem: 'Dados inseridos com sucesso.' });
        }
    }

    return res.status(204).json({ mensagem: 'Nenhum dado novo para inserir.' });
}


async function RetornarDadosMercadoPadoJsonMes(req, res) {

    const query = "SELECT id, name, avatarImage, data, valor, handleNotion FROM gastos_mensais_notion WHERE MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE()) ORDER BY data DESC;";
    const resultadoVerificacao = await executeQuery(query, []);
    console.log(resultadoVerificacao)
    return res.status(200).json({ mensagem: 'Sucesso', resultadoVerificacao });

}



// Função para gerar UUID aleatório
function generateUUID() {
    return require('crypto').randomUUID();
}

async function BuscarGastosTotais(req, res) {
    const { mes, ano } = req.query;

    const mesAtual = !mes ? new Date().getMonth() + 1 : mes;
    const anoAtual = !ano ? new Date().getFullYear() : ano;

    const queryGastos = `
        SELECT 
        SUM(valor) AS 'Total'
        FROM 
            gastos_mensais_notion
        WHERE
        YEAR(data) = ? AND 
        MONTH(data) = ?;
    `;

    const queryMesGasto = `
        SELECT 
        DATE_FORMAT(CURDATE(), '%Y-%m') AS 'Mes'
        FROM 
            gastos_mensais_notion
        WHERE
        YEAR(data) = ? AND 
        MONTH(data) = ?
        GROUP BY 'Mes';
    `;

    try {
        const result = await executeQuery(queryGastos, [anoAtual, mesAtual]);
        const result2 = await executeQuery(queryMesGasto, [anoAtual, mesAtual]);

        if (result.length && result2.length) {
            // Acessa o valor de 'Total' e 'Mes' diretamente
            const totalGastos = result[0]?.Total || 0;
            const mesAtualFormatado = result2[0]?.Mes || null;

            return res.status(200).json({
                mensagem: 'ok',
                total: totalGastos,
                mes: mesAtualFormatado,
            });
        } else {
            return res.status(404).json({ error: 'Sem dados na query' });
        }
    } catch (error) {
        console.error('Erro ao executar a query:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
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

module.exports = { PegarDadosMercadoPadoJsonPadrao, RetornarDadosMercadoPadoJsonMes , BuscarGastosTotais};
