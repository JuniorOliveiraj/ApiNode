// Importe as dependências necessárias (jwt, connection, etc.)
const jwt = require('jsonwebtoken');
const connection = require('../models/bd'); // Importe a configuração de conexão com o banco de dados
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';
// Função da rota privada
function addProdutos(req, res) {
    // Verificar se o token de acesso foi fornecido
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso não fornecido.' });
    }
    try {
        // Verificar se o token é válido e decodificar os dados do usuário
        const decoded = jwt.verify(token, key);

        // Dados recebidos da requisição GET
        const { name, valor, quantidade, ativo, imagen } = req.query;

        // Dados recebidos da requisição GET
        const data = {
            name_produto: name,
            valor_produto: valor,
            quantidade_produto: quantidade,
            status_produto: ativo,
            imagem_produto: imagen ? imagen : ''
        };

        // Verifique se todos os campos foram preenchidos
        if (!name || !valor || !quantidade || !ativo) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.', data: data });

        }

        // Salve os dados no banco de dados
        connection.query('INSERT INTO produtosAgro SET ?', data, (err, result) => {
            if (err) {
                console.error('Erro ao inserir os dados no banco de dados:', err);
                return res.status(500).json({ error: 'Erro interno do servidor.' });
            }

            return res.status(201).json({ message: 'Dados salvos com sucesso.' });
        });

    } catch (error) {
        // O token é inválido ou expirou
        return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
    }
}



function allProduct(req, res) {
    // Verificar se o token de acesso foi fornecido
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso não fornecido.' });
    }
    try {
        // Verificar se o token é válido e decodificar os dados do usuário
        const decoded = jwt.verify(token, key);

        // Dados recebidos da requisição GET
        const { name, valor, quantidade, ativo, imagen } = req.query;

        // Dados recebidos da requisição GET
        connection.query('SELECT * FROM produtosAgro', (error, results) => {
            if (error) {
                console.error('Erro ao executar a consulta:', error);
                res.status(500).json({ error: 'Erro ao recuperar usuários.' });
                return;
            }
            res.json(results);
            
        });

    } catch (error) {
        // O token é inválido ou expirou
        return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
    }
}



module.exports = { addProdutos, allProduct }