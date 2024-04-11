async function zplConvert(req, res) {
    const { body, files } = req;
    const zplFile = files[0]; // Pegue o primeiro arquivo ZPL
    const zplContent = zplFile.buffer.toString('utf-8'); // Converta o buffer em uma string
    // Agora você tem o conteúdo do arquivo ZPL em zplContent
    const zplFiles = [];
    files.forEach((file) => {
        if (file.originalname.endsWith('.zpl')) {
            // Se sim, converte o conteúdo do arquivo para uma string
            const zplContent = file.buffer.toString('utf-8');
            // Adiciona o conteúdo do arquivo ZPL ao array
            zplFiles.push(zplContent);
        }
    });
    

    return res.status(200).json({ mensagem: zplFiles});

}

module.exports = { zplConvert }
