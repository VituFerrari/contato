const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Import do pacote mysql
const cors = require('cors'); // Import do pacote cors

const app = express();
const port = 3000;

// Configuração da conexão com o banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Username do USBWebServer
  password: 'usbw', // Senha do USBWebServer
  database: 'contato' // Substitua pelo nome do seu banco de dados
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados');
});

// Middleware para interpretar o corpo das requisições como JSON
app.use(bodyParser.json());

// Middleware para permitir requisições CORS
app.use(cors()); // Permite requisições de qualquer origem

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Rota para salvar contato
app.post('/contato', (req, res) => {
  const { nome, telefone, data } = req.body;

  if (!nome || !telefone || !data) {
    return res.status(400).send('Campos obrigatórios ausentes');
  }

  // Consulta SQL para inserir dados
  const query = 'INSERT INTO cliente (nome, telefone, data_contato) VALUES (?, ?, ?)';
  db.query(query, [nome, telefone, data], (err, results) => {
    if (err) {
      console.error('Erro ao inserir dados:', err);
      return res.status(500).send(`Erro ao salvar contato: ${err.message}`);
    }
    res.status(200).send('Contato salvo com sucesso');
  });
});

// Rota para obter todos os contatos
app.get('/contatos', (req, res) => {
  // Consulta SQL para obter todos os contatos e formatar a data
  const query = `
    SELECT
      id,
      nome,
      telefone,
      DATE_FORMAT(data_contato, '%d/%m/%Y') AS data_contato
    FROM cliente 
    ORDER BY data_contato ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao recuperar dados:', err);
      return res.status(500).send(`Erro ao recuperar contatos: ${err.message}`);
    }
    res.json(results);
  });
});

// Rota para atualizar os dados do contato
app.put('/contato/:id', (req, res) => {
  const contatoId = req.params.id;
  const { nome, telefone, data_contato } = req.body;

  if (!nome || !telefone || !data_contato) {
      return res.status(400).send('Campos obrigatórios ausentes');
  }

  // Consulta SQL para atualizar todos os dados do contato
  const query = 'UPDATE cliente SET nome = ?, telefone = ?, data_contato = ? WHERE id = ?';
  db.query(query, [nome, telefone, data_contato, contatoId], (err, results) => {
      if (err) {
          console.error('Erro ao atualizar dados:', err);
          return res.status(500).send(`Erro ao atualizar contato: ${err.message}`);
      }
      res.status(200).send('Contato atualizado com sucesso');
  });
});

// Rota para atualizar apenas a data do contato
app.patch('/contato/:id', (req, res) => {
  const contatoId = req.params.id;
  const { data_contato } = req.body;

  if (!data_contato) {
    return res.status(400).send('Campo data_contato ausente');
  }

  // Consulta SQL para atualizar a data do contato
  const query = 'UPDATE cliente SET data_contato = ? WHERE id = ?';
  db.query(query, [data_contato, contatoId], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar dados:', err);
      return res.status(500).send(`Erro ao atualizar contato: ${err.message}`);
    }
    res.status(200).send('Data do contato atualizada com sucesso');
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});