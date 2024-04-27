
const connection = require('../../models/bd');
async function ListTags(req, res) {
    try {
        try {
            const blogQuery = 'SELECT DISTINCT tag_value FROM  blog_tags';
            const blogValues = [];
            const data = await executeQuery(blogQuery, blogValues);
            const dadosFormatados = data.map(resultado => resultado.tag_value);
            return res.status(200).json({ message: 'sucess', data: dadosFormatados });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error, message: 'Erro interno do servidor.' });
        }

    } catch (error) {
        return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
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



module.exports = { ListTags };
