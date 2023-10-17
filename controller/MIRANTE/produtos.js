const connection = require("../../models/bd")

function produtosMirante(req, res) {
    const sql = `
    SELECT 
        P.id_produto,
        C.nome_categoria AS categoria,
        S.nome_subcategoria AS subcategoria,
        P.nome_produto AS produto,
        I.url_arquivo AS imagem
    FROM
        Mirante_Categorias C
    LEFT JOIN 
        Mirante_Subcategorias S ON C.id_categoria = S.id_categoria
    LEFT JOIN 
        Mirante_Produtos P ON S.id_subcategoria = P.id_subcategoria
    LEFT JOIN 
        Mirante_Imagens I ON P.id_produto = I.id_produto;
`;

    connection.query(sql, (error, results, fields) => {
        if (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        } else {
            const produtos = {};
            results.forEach(row => {
                const { id_produto, categoria, subcategoria, produto, imagem } = row;
                if (!produtos[categoria]) {
                    produtos[categoria] = {};
                }
                if (!produtos[categoria][subcategoria]) {
                    produtos[categoria][subcategoria] = {};
                }
                if (!produtos[categoria][subcategoria][produto]) {
                    produtos[categoria][subcategoria][produto] = {
                        id_produto,
                        url: []
                    };
                }
                if (imagem) {
                    produtos[categoria][subcategoria][produto].url.push(imagem);
                }
            });
            res.status(200).json({ message: 'TODOS OS PRODUTOS', PRODUTOS: produtos });
        }
    });

}

async function AddprodutosMirante(req, res) {
    const { id_produto, urls } = req.headers;

    // Verifica se id_produto e urls estão presentes no corpo da requisição
    if (!id_produto || !urls ) {
        return res.status(400).json({ mensagem: 'Campos id_produto e urls são obrigatórios e urls deve ser um array não vazio.' });
    }

    const sql = 'INSERT INTO Mirante_Imagens (id_produto, nome_arquivo, url_arquivo) VALUES (?, ?, ?);';

    try {
   
        // Itera sobre as URLs e insere cada uma no banco de dados
        // for (const url of urlsArray) {
        //     // Tenta executar a query no banco de dados para cada URL
        //     //await executeQuery(sql, [id_produto, 'url', urls]);
        //     console.log(url)
        // }
        await executeQuery(sql, [id_produto, 'url', urls]);
  

        return res.status(200).json({ mensagem: 'Registros inseridos com sucesso.' });
    } catch (error) {
        // Em caso de erro, retorna uma resposta de erro com status 500
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro ao inserir os registros.' });
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


module.exports = { produtosMirante, AddprodutosMirante }