const { google } = require('googleapis');
const fs = require('fs');
const stream = require('stream');
const GOOGLE_API_FOLDER_ID = '1PWdPwKCkp7FEY1XVRz0idtuBJOrHtpQK';

// Carrega as credenciais de autenticação do arquivo 'GOOGLE.json'
const credentials = require('../../google-key.json');

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



module.exports = { uploadFile };

