const axios = require('axios');
const cron = require('node-cron');
const db = require('../../models/bd');



async function executeQuery(sql, values) {
  return new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
          if (err) {
              reject(err);
          } else {
              resolve(result);
          }
      });
  });
}

async function fetchData() {
  try {
      // Faça a requisição à API do cliente
      const response = await axios.get('https://lojamirante.com.br/api/getCouponUse?codigo=CupomP5,MIRANTE5,VOLTA5,carrinho5,presenteespecial,duda10,duda,figueredo10,FG7,vinicius10,VINI,emfoco10,EMFOCO');

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
      } else {
          console.error('Resposta da API não está no formato esperado.');
      }
  } catch (error) {
      console.error('Erro ao atualizar os dados:', error.message);
  }
}


cron.schedule('06 00 * * *', fetchData); // 1ª execução às 01:00 da manhã
cron.schedule('0 15 * * *', fetchData); // 2ª execução às 15:00 da tarde
cron.schedule('59 23 * * *', fetchData); // 3ª execução às 00:00 da noite