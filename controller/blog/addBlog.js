
const connection = require('../../models/bd');
const jwt = require('jsonwebtoken');
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';


async function addBlog(req, res) {
  try {
    const { userId, dadosBlog, urlCapa } = req.query;
    const { authorization } = req.headers;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso não fornecido.' });
    }
    // Dados recebidos da requisição GET
    const decoded = jwt.verify(token, key);

    if (decoded) {
      try {
        // Verifique se os campos obrigatórios foram fornecidos
        if (!userId) {
          return res.status(400).json({ error: 'Usuário não encontrado.' });
        }
        if (!dadosBlog) {
          return res.status(400).json({ error: 'Dados do blog não fornecidos.' });
        }

        const { title, description, content, cover, tags, comments, publish, metaTitle, metaDescription } = dadosBlog;
        if (!title || !description || !content || !cover || !tags) {
          if (!title) {
            return res.status(400).json({ error: 'Título do blog não fornecido.' });
          }
          if (!description) {
            return res.status(400).json({ error: 'Descrição do blog não fornecida.' });
          }
          if (!content) {
            return res.status(400).json({ error: 'Conteúdo do blog não fornecido.' });
          }
          if (!tags) {
            return res.status(400).json({ error: 'Tags do blog não fornecidas.' });
          }
        }

        // Abrir uma nova conexão para inserir o blog


        try {
          // Inserir o blog na tabela 'blogs'
          const blogQuery = 'INSERT INTO blogs (title, description, content, cover_link, publish, meta_title, meta_description, user_id, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
          const blogValues = [title, description, content, urlCapa, publish ? 1 : 0, metaTitle, metaDescription, userId, comments ? 1 : 0];
          const blogResult = await executeQuery(blogQuery, blogValues);
          const blogId = blogResult.insertId;

          // Inserir as tags relacionadas ao blog na tabela 'blog_tags'
          if (tags && tags.length > 0) {
            for (const tagId of tags) {
              const tagQuery = 'INSERT INTO blog_tags (blog_id, tag_value) VALUES (?, ?)';
              const tagValues = [blogId, tagId];
              await executeQuery(tagQuery, tagValues);
            }
          }

          await executeQuery('COMMIT', []);

          return res.status(200).json({ message: 'Blog adicionado com sucesso.' });
        } catch (error) {
          await executeQuery('ROLLBACK', []);
          console.error('Erro ao inserir o blog ou as tags no banco de dados:', error);
          return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error, message: 'Erro interno do servidor.' });
      }
    } else {
      return res.status(401).json({ error: 'Token não autorizado .' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
  }
}


async function ListBlog(req, res) {
  try {
    const blogQuery = 'SELECT blogs.id,blogs.cover_link,blogs.title, users.name, users.avatarUrl FROM blogs INNER JOIN users ON blogs.user_id = users.id order by  blogs.created_at';
    const blogValues = [];
    const blogResult = await executeQuery(blogQuery, blogValues);
    const data = new Date();
    const formattedBlogs = blogResult.map(blog => ({
      id: blog.id,
      cover: blog.cover_link,
      title: blog.title,
      createdAt: data,
      view: 2,
      comment: 0,
      share: 2,
      favorite: 1,
      author: {
        name: blog.name,
        avatarUrl: blog.avatarUrl,
      },
    }));

    return res.status(200).json({ message: 'TODOS OS BLOGS', BLOG: formattedBlogs });
  } catch (error) {
    console.error('Erro ao buscar os blogs:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
async function readBlog(req, res) {
  const { id } = req.query;
  if(!id){
    return res.status(404).json({ error: 'id não encontrado.' });
  }
  try {
    const blogQuery = `
    
        SELECT 
            blogs.id,
            blogs.title,
            blogs.description,
            blogs.content,
            blogs.cover_link,
            blogs.comments,
            blogs.meta_title,
            blogs.meta_description,
            blogs.created_at,
            users.name,
            users.avatarUrl,
            GROUP_CONCAT(blog_tags.tag_value) as tag_values
        FROM 
            blogs
        INNER JOIN 
            users ON blogs.user_id = users.id 
        INNER JOIN 
            blog_tags ON blog_tags.blog_id = blogs.id
        WHERE 
            blogs.id = ?
        GROUP BY 
            blogs.id
    `;
    const blogValues = [id];
    const blogResult = await executeQuery(blogQuery, blogValues);
    const data = new Date();
    const formattedBlogs = blogResult.map(blog => ({
      id: blog.id,
      cover: blog.cover_link,
      title: blog.title,
      comment: blog.comments,
      like:true,
      author: {
        name: blog.name,
        avatarUrl: blog.avatarUrl
      },
      comments: [
    {
      "id": 2,
      "name": "Alice Brown",
      "avatarUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkb5MwXJPW1fkMe_RR8NDge491YmPLwJfe0J_73wkyuYpZwN-XQy7Jt73isBqWzO_ed7o&usqp=CAU",
      "postedAt": "2023-07-02T10:00:00Z",
      "message": "Second comment",
      "replyComment": [],
      "users": []
    }

      ],
      tags:  blog.tag_values.split(',')
      ,
      favoritePerson: [ ],
      meta: [
        {
          title: blog.meta_title,
          description: blog.meta_description
        }
      ],
      description: blog.description,
      body: blog.content

    }));
    

    return res.status(200).json({ message: 'TODOS OS BLOGS', BLOG: formattedBlogs[0] });
  } catch (error) {
    console.error('Erro ao buscar os blogs:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
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

module.exports = { addBlog, ListBlog, readBlog };

