const connection = require('../models/bd');


const listaridNoticia = async (req, res) => {
    try {
        const id = req.query.id;
        // Verificar se o ID do usuário foi fornecido
        if (!id) {
            return res.status(400).json({ error: 'ID do usuário não fornecido' });
        }

        // Montar a query para buscar as notícias favoritas
        const query = `SELECT * FROM news where id = ? ORDER BY created_at`;
        const values = [id];
        const update = `UPDATE news SET lida = 1 WHERE id = ?`
        const result = await executeQuery(update, values);
        // Executar a query usando a conexão do pool
        connection.query(query, values, (err, results) => {
            if (err) {
                console.error('Erro ao buscar as notícias favoritas:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // Formatar os resultados no formato desejado
            const noticias = results.map(noticia => ({
                id: noticia.id,
                status: noticia.status,
                title: noticia.title,
                content: noticia.content,
                description: noticia.description,
                image: noticia.image,
                publishedAt: noticia.publishedAt,
                url: noticia.url,
                source: {
                    name: noticia.source_name,
                    url: noticia.source_url
                }
            }));

            // Retornar as notícias favoritas em formato JSON
            return res.json(noticias);
        });
    } catch (error) {
        console.error('Erro:', error.message);
        return res.status(500).json({ error: 'Erro ao buscar as notícias favoritas' });
    }
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



module.exports = {
    listaridNoticia
}