const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Função para criar a pasta caso não exista
function createDirectoryIfNotExists(directoryPath) {
  const fullPath = path.join(__dirname, 'public', directoryPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

// Função para obter a URL da imagem
function getImageUrl(directoryPath, filename) {
  return `http://localhost:3001${directoryPath}/${filename}`;
}

// Função para salvar a imagem no caminho especificado
function saveImage(directoryPath, req, res) {
  return new Promise((resolve, reject) => {
    createDirectoryIfNotExists(directoryPath);

    const storage = multer.diskStorage({
      destination: path.join(__dirname, 'public', directoryPath),
      filename: (req, file, cb) => {
        const filename = file.originalname;
        const filepath = path.join(directoryPath, filename);

        // Verifica se o arquivo já existe
        if (fs.existsSync(filepath)) {
          // Arquivo já existe, rejeita a promessa
          reject(new Error('O arquivo já existe.'));
        } else {
          // Arquivo não existe, continua com o processo de salvamento
          cb(null, filename);
        }
      }
    });

    const upload = multer({ storage }).single('image');

    upload(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        // Erro do multer (por exemplo, arquivo muito grande, formato inválido, etc.)
        reject(error);
      } else if (error) {
        // Outro erro ocorreu durante o upload
        reject(error);
      } else {
        // Upload bem-sucedido
        if (req.file) {
          const filename = req.file.filename;
          const imageUrl = getImageUrl(directoryPath, filename);
          resolve(imageUrl);
        } else {
          // Nenhum arquivo foi enviado
          reject(new Error('Nenhum arquivo foi enviado.'));
        }
      }
    });
  });
}

async function uploadImagem(req, res) {
  try {
    const { file, teste } = req.query;
    const imageUrl = await saveImage('/imagem', req, res);
    res.json({ url: imageUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ocorreu um erro ao salvar a imagem' });
  }
}

module.exports = { uploadImagem, saveImage };
