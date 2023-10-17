const connection = require('../../models/bd');
const jsonDados = require('./json.json');


// Função para inserir categoria
function inserirCategoria(nomeCategoria) {
    const query = 'INSERT INTO Mirante_Categorias (nome_categoria) VALUES (?)';
    connection.query(query, [nomeCategoria], (error, results, fields) => {
        if (error) throw error;
        console.log('Categoria inserida com sucesso:', results.insertId);
    });
}

// Função para obter o ID da categoria
function obterIdCategoria(nomeCategoria, callback) {
    const query = 'SELECT id_categoria FROM Mirante_Categorias WHERE nome_categoria = ?';
    connection.query(query, [nomeCategoria], (error, results, fields) => {
        if (error) throw error;
        if (results.length > 0) {
            callback(results[0].id_categoria);
        } else {
            callback(null);
        }
    });
}

// Função para inserir subcategoria
function inserirSubcategoria(idCategoria, nomeSubcategoria) {
    const query = 'INSERT INTO Mirante_Subcategorias (id_categoria, nome_subcategoria) VALUES (?, ?)';
    connection.query(query, [idCategoria, nomeSubcategoria], (error, results, fields) => {
        if (error) throw error;
        console.log('Subcategoria inserida com sucesso:', results.insertId);
    });
}

// Função para obter o ID da subcategoria
function obterIdSubcategoria(idCategoria, nomeSubcategoria, callback) {
    const query = 'SELECT id_subcategoria FROM Mirante_Subcategorias WHERE id_categoria = ? AND nome_subcategoria = ?';
    connection.query(query, [idCategoria, nomeSubcategoria], (error, results, fields) => {
        if (error) throw error;
        if (results.length > 0) {
            callback(results[0].id_subcategoria);
        } else {
            callback(null);
        }
    });
}

// Função para inserir produto
function inserirProduto(idSubcategoria, nomeProduto) {
    const query = 'INSERT INTO Produtos (id_subcategoria, nome_produto) VALUES (?, ?)';
    connection.query(query, [idSubcategoria, nomeProduto], (error, results, fields) => {
        if (error) throw error;
        console.log('Produto inserido com sucesso:', results.insertId);
    });
}

// Função para obter o ID do produto
function obterIdProduto(idSubcategoria, nomeProduto, callback) {
    const query = 'SELECT id_produto FROM Mirante_Produtos WHERE id_subcategoria = ? AND nome_produto = ?';
    connection.query(query, [idSubcategoria, nomeProduto], (error, results, fields) => {
        if (error) throw error;
        if (results.length > 0) {
            callback(results[0].id_produto);
        } else {
            callback(null);
        }
    });
}

// Função para inserir imagem
function inserirImagem(idProduto, nomeArquivo, urlArquivo) {
    const query = 'INSERT INTO Imagens (id_produto, nome_arquivo, url_arquivo) VALUES (?, ?, ?)';
    connection.query(query, [idProduto, nomeArquivo, urlArquivo], (error, results, fields) => {
        if (error) throw error;
        console.log('Imagem inserida com sucesso:', results.insertId);
    });
}


function adicionarDadosAoBanco() {
    const seuJson = jsonDados;

    for (const categoriaNome in seuJson) {
        inserirCategoria(categoriaNome);

        obterIdCategoria(categoriaNome, (idCategoria) => {
            if (idCategoria) {
                for (const subcategoriaNome in seuJson[categoriaNome]) {
                    inserirSubcategoria(idCategoria, subcategoriaNome);

                    obterIdSubcategoria(idCategoria, subcategoriaNome, (idSubcategoria) => {
                        if (idSubcategoria) {
                            for (const produtoNome in seuJson[categoriaNome][subcategoriaNome]) {
                                inserirProduto(idSubcategoria, produtoNome);

                                obterIdProduto(idSubcategoria, produtoNome, (idProduto) => {
                                    if (idProduto) {
                                        for (const urlArquivo of seuJson[categoriaNome][subcategoriaNome][produtoNome]) {
                                            inserirImagem(idProduto, 'url', urlArquivo);
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    connection.end();
}

connection.end();
module.exports = { adicionarDadosAoBanco}

// Fechar conexão com o banco de dados