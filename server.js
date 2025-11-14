const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir frontend estático (index.html está na raiz)
app.use('/', express.static(path.join(__dirname)));

// Roteador de veículos / API
const veiculosRouter = require('./veiculos');
app.use('/api/veiculos', veiculosRouter);

// Rota para previsão do tempo (proxy simples para OpenWeather via route no veiculos)
app.use('/api/previsao', (req, res, next) => {
  // encaminha para o roteador veiculos que trata /previsao
  req.url = '/previsao' + (req.url === '/' ? '' : req.url);
  return veiculosRouter.handle(req, res, next);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
