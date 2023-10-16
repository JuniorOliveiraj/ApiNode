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


module.exports = {produtosMirante }