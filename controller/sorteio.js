
const connection = require('../models/bd');



async function CadastrarParticipante(req, res) {
    const { nome } = req.query;

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome é obrigatório.' });
    }

    try {
        const verificarQuery = `SELECT COUNT(*) AS total FROM participants WHERE name = ?`;
        const verificarResultado = await executeQuery(verificarQuery, [nome]);

        if (verificarResultado[0].total > 0) {
            return res.status(400).json({ mensagem: 'Participante já cadastrado.' });
        }

        const inserirQuery = `INSERT INTO participants (name) VALUES (?)`;
        await executeQuery(inserirQuery, [nome]);

        return res.status(201).json({ mensagem: 'Participante cadastrado com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro ao cadastrar participante.' });
    }
}

 
async function VisualizarSorteio(req, res) {
    const { participantId } = req.query;

    if (!participantId) {
        return res.status(400).json({ mensagem: 'ID do participante é obrigatório.' });
    }

    try {
        // Consulta para pegar os sorteios deste participante
        const visualizarQuery = `
            SELECT id_sorteador, nome_sorteado, viewed
            FROM sorteios
            WHERE id_sorteador = 1 AND (viewed <> 1 OR viewed IS NULL);`;
        const resultado = await executeQuery(visualizarQuery, [participantId]);

        if (resultado.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum sorteio encontrado para este participante.' });
        }

        // Verificar se o participante já visualizou o sorteio
        if (resultado[0].viewed) {
            return res.status(200).json({ mensagem: 'Você já visualizou este sorteio.' });
        }

        // Atualizar para "visualizado"
        const atualizarQuery = `UPDATE sorteios SET viewed = 1 WHERE id_sorteador = ?`;
        await executeQuery(atualizarQuery, [participantId]);

        return res.status(200).json({
            mensagem: 'Sorteio visualizado com sucesso.',
            sorteador: resultado[0].id_sorteador,
            sorteado: resultado[0].nome_sorteado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro ao visualizar o sorteio.' });
    }
}




async function RealizarSorteio(req, res) {
    try {
        // Passo 1: Limpar a tabela de sorteios antes de começar
        const queryLimparTabela = "DELETE FROM sorteios;";
        await executeQuery(queryLimparTabela);

        const queryParticipantes = "SELECT id, name FROM participants;";
        const participantesDisponiveis = await executeQuery(queryParticipantes);

        if (!participantesDisponiveis.length) {
            return res.status(404).json({ mensagem: 'Nenhum participante disponível para o sorteio.' });
        }

        console.log('Participantes disponíveis:', participantesDisponiveis);

        // Passo 2: Copiar os participantes e embaralhar para o sorteio
        const participantesSorteados = [...participantesDisponiveis];
        shuffleArray(participantesSorteados);

        console.log('Participantes sorteados após shuffle:', participantesSorteados);

        const combinacoes = [];

        for (let i = 0; i < participantesDisponiveis.length; i++) {
            const sorteador = participantesDisponiveis[i];
            let sorteado = participantesSorteados[i];

            // Garantir que ninguém tire a si mesmo
            if (sorteador.id === sorteado.id) {
                if (i === participantesDisponiveis.length - 1) {
                    // Trocar com o primeiro se for o último
                    sorteado = participantesSorteados[0];
                    participantesSorteados[0] = participantesSorteados[i];
                } else {
                    // Trocar com o próximo
                    sorteado = participantesSorteados[i + 1];
                    participantesSorteados[i + 1] = participantesSorteados[i];
                }
            }

            combinacoes.push({ sorteador, sorteado });
        }

        console.log('Combinações geradas:', combinacoes);

        // Passo 3: Preparar os valores para inserção no banco
        const valoresParaInserir = combinacoes.map(({ sorteador, sorteado }) => [
            sorteador.id,
            sorteado.name,
        ]);

        console.log('Valores para inserir no banco:', valoresParaInserir);

        // Query para inserir o sorteio no banco
        const queryInsertSorteios = `
        INSERT INTO sorteios (id_sorteador, nome_sorteado)
        VALUES ?
        `;

        // Corrigido o nome da variável para `queryInsertSorteios`
        const resultadoInsercao = await executeQuery(queryInsertSorteios, [valoresParaInserir]);

        console.log('Resultado da inserção no banco:', resultadoInsercao);

        return res.status(200).json({
            mensagem: 'Sorteio realizado com sucesso.',
            combinacoes,
        });
    } catch (error) {
        console.error('Erro ao realizar sorteio:', error);
        return res.status(500).json({ mensagem: 'Erro ao realizar o sorteio.', error });
    }
}

// Função auxiliar para embaralhar um array
function shuffleArray(array) {
    // Usando Math.random() e uma forma correta de embaralhar para garantir a aleatoriedade
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
    }
}


module.exports = { 
    CadastrarParticipante, 
    RealizarSorteio, 
    VisualizarSorteio 
};


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