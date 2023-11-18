const connection = require("../../models/bd")
const axios = require('axios');
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
    if (!id_produto || !urls) {
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





function RequestMirante(req, res) {
    const url = 'https://lojamirante.com.br/feed/imagensProdutos';

    axios.get(url)
        .then(response => {
            console.log('Status: ', response.status);
            // Retornar status 200 em caso de sucesso
            if (response.status === 200) {
                console.log('Requisição bem-sucedida!');
                return res.status(200).json({ mensagem: 'Requisição bem-sucedida!.', PRODUTOS: response.data });
            } else {
                console.log('Falha na requisição.');
                return res.status(500).json({ mensagem: 'Falha na requisição.' });
            }
        })
        .catch(error => {
            // Retornar status de falha em caso de erro
            console.error('Erro na requisição:', error.message);
        });

}



function ProdutosGaleria(req, res) {
    const { foder } = req.query;
    const url = `https://www.lojamirante.com.br/adm/produtos/getImagesByFolder/${foder ? foder : 0}`;
    const cookie = '_gcl_au=1.1.841080069.1690978702; _fbp=fb.2.1690978701657.620299206; _ga_KC8Y9TJF7K=deleted; cartstack.com-cartid=NDgzMTY5NTI4; cartstack.com-bwrid=NjU2MDMzOTQ=; xe_visitor=eyJpZCI6IjBkNWE1ODBjLThiMjItNDZiMi04YTdlLWRmYjMyOTI4ODI2YyIsImVtYWlsIjoibWlkaWFsb2phbWlyYW50ZUBnbWFpbC5jb20iLCJjcGgiOiI0Nzk5MjkxMjIyMiJ9; dinLeadTrack=eyJyZWZlcnJlciI6Imxpbmt0ci5lZSIsInJlZmVycmVyX3Bvc3RlZCI6dHJ1ZSwidXNlcl9pbmZvX3R5cGUiOiJQQyIsInVzZXJfaW5mbyI6IlBRbUdPLkEuYzU5MCJ9; _gcl_aw=GCL.1697808786.CjwKCAjwysipBhBXEiwApJOcu6mRhuOBcCxGXrrnMHh4ZF9gGX76ZsydOvddWt4csmIp8DLsnHPPIRoCkWMQAvD_BwE; _gac_UA-98717817-1=1.1697808786.CjwKCAjwysipBhBXEiwApJOcu6mRhuOBcCxGXrrnMHh4ZF9gGX76ZsydOvddWt4csmIp8DLsnHPPIRoCkWMQAvD_BwE; _gid=GA1.3.2143227991.1698059131; dinTrafficSource=eyJ1cmwiOiJodHRwczovL3d3dy5sb2phbWlyYW50ZS5jb20uYnIvIiwicmVmZXJlciI6IiJ9; _clck=111r7iv|2|fg4|0|1322; xe_config=Mk43VTYyQjA5MCw0MjMzNzBFNC1EOUY2LTZGMTMtNEJCRS00OEY1NkZFQTJGQzksbG9qYW1pcmFudGUuY29tLmJy; _ga=GA1.3.1799049818.1690978702; _clsk=c4n4nr|1698147809479|8|1|u.clarity.ms/collect; ci_session=b3vonmm8qic6dnocn6hrbmj0ebfm5uhb; _ga_KC8Y9TJF7K=GS1.1.1698146198.102.1.1698147812.60.0.0'
    axios.get(`${url}`, {
        headers: {
            Cookie: cookie
        }
    })
        .then(response => {
            console.log('Status: ', response.status);
            // Retornar status 200 em caso de sucesso
            if (response.status === 200) {
                console.log('Requisição bem-sucedida!');
                return res.status(200).json({ mensagem: 'Requisição bem-sucedida!.', PRODUTOS: response.data });
            } else {
                console.log('Falha na requisição.');
                return res.status(500).json({ mensagem: 'Falha na requisição.' });
            }
        })
        .catch(error => {
            // Retornar status de falha em caso de erro
            console.error('Erro na requisição:', error.message);
        });

}





async function RequestDownload(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'A URL deve ser fornecida.' });
    }

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${url.replace(/^.*[\\\/]/, '')}`);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Falha ao realizar o download do arquivo.' });
    }
}



async function fetchData(req, res) {
    try {
        // Faça a requisição à API do cliente
        const response = await axios.get('https://lojamirante.com.br/api/getCouponUse?codigo=VINI');
  
        // Verifique se a resposta contém dados
        if (response.data && Array.isArray(response.data)) {
            // Itere sobre os objetos no array
            for (const cupom of response.data) {
                const { Código, quantidade } = cupom;
  
                // Converta a quantidade para um número (se necessário)
                const quantidadeInt = parseInt(quantidade, 10);
  
                // Salve os dados no banco de dados
                const currentDate = new Date().toISOString().split('T')[0];
                const sql = 'INSERT INTO Mirante_cupons (nome, usus, data_por_dia, semana_do_ano, mes_do_ano) VALUES (?, ?, ?, WEEK(?), MONTH(?))';
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





module.exports = { produtosMirante, AddprodutosMirante, RequestMirante, RequestDownload, ProdutosGaleria, fetchData }