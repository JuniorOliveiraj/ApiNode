const { google } = require('googleapis');
const fs = require('fs');
const stream = require('stream');
const GOOGLE_API_FOLDER_ID = '1PWdPwKCkp7FEY1XVRz0idtuBJOrHtpQK';

// Carrega as credenciais de autenticação do arquivo 'GOOGLE.json'
require('dotenv').config();

const credentials ={
  "type": process.env.DRIVE_TYPE,
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": process.env.PRIVATE_KEY,
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
  "universe_domain": process.env.UNIVERSE_DOMAIN
};


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

