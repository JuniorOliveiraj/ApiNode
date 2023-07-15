const { google } = require('googleapis');
const fs = require('fs');
const stream = require('stream');
const GOOGLE_API_FOLDER_ID = '1Mn-a8zRrVjgIoK0j5jngr0hMBI61MTG9';

// Carrega as credenciais de autenticação do arquivo 'GOOGLE.json'
const credentials = require('./google-key.json');

// Cria um cliente OAuth2 com as credenciais
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

// Cria o cliente do Google Drive
const driveClient = google.drive({ version: 'v3', auth });

const checkIfFileExists = async (fileName) => {
  const response = await driveClient.files.list({
    q: `name='${fileName}' and parents='${GOOGLE_API_FOLDER_ID}'`,
    fields: 'files(id)',
  });
  const files = response.data.files;
  if (files && files.length > 0) {
    return files[0].id;
  }
  return null;
};

const uploadFile = async (fileObject) => {
  const fileId = await checkIfFileExists(fileObject.originalname);
  if (fileId) {
    console.log(`File ${fileObject.originalname} already exists with ID ${fileId}`);
    return fileId;
  }

  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);
  const { data } = await driveClient.files.create({
    media: {
      mimeType: fileObject.mimeType,
      body: bufferStream,
    },
    requestBody: {
      name: fileObject.originalname,
      parents: [GOOGLE_API_FOLDER_ID],
    },
    fields: 'id,name',
  });
  console.log(`Uploaded file ${data.name} ${data.id}`);
  return data.id;
};

async function uploadImagem(req, res) {
  try {
    const { body, files } = req;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }
    
    const fileUrls = [];
    
    for (let f = 0; f < files.length; f += 1) {
      const fileId = await uploadFile(files[f]);
      const url = `https://drive.google.com/uc?export=view&id=${fileId}`;
      fileUrls.push(url);
    }

    res.status(200).json({ urls: fileUrls });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ocorreu um erro ao fazer o upload do arquivo.' });
  }
}

module.exports = { uploadImagem };

