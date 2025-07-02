# Garagem Inteligente - Backend & Frontend

Este projeto é uma aplicação web completa para gerenciamento de uma garagem inteligente, com frontend dinâmico e backend Node.js/Express publicado na nuvem.

## Funcionalidades
- Consulta de previsão do tempo para viagens
- Listagem de dicas de manutenção (gerais e por tipo de veículo)
- Exibição de veículos em destaque
- Listagem de serviços oferecidos pela garagem
- Ferramentas essenciais para o mecânico/entusiasta
- Tratamento de erros e mensagens amigáveis

## Endpoints da API (Backend)

### Previsão do Tempo
- `GET /api/previsao/:cidade`
  - Retorna a previsão do tempo para a cidade informada.
  - **Exemplo:** `/api/previsao/Sao Paulo`

### Dicas de Manutenção
- `GET /api/dicas-manutencao`
  - Retorna uma lista de dicas gerais de manutenção.
- `GET /api/dicas-manutencao/:tipoVeiculo`
  - Retorna dicas específicas para o tipo de veículo (`carro`, `moto`, `caminhao`, `carroesportivo`).
  - **Exemplo:** `/api/dicas-manutencao/carro`

### Arsenal de Dados da Garagem
- `GET /api/garagem/veiculos-destaque`
  - Lista veículos em destaque na garagem.
- `GET /api/garagem/servicos-oferecidos`
  - Lista os serviços oferecidos pela garagem.
- `GET /api/garagem/ferramentas-essenciais`
  - Lista ferramentas essenciais para o mecânico/entusiasta.
- `GET /api/garagem/servicos-oferecidos/:idServico`
  - Retorna detalhes de um serviço específico pelo ID.
  - **Exemplo:** `/api/garagem/servicos-oferecidos/svc001`

## Como rodar localmente

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz com sua chave da OpenWeatherMap:
   ```env
   OPENWEATHER_API_KEY=SUACHAVEAQUI
   ```
4. Inicie o backend:
   ```bash
   node js/server.js
   ```
5. Abra o `index.html` no navegador para testar o frontend localmente.

## Deploy

- **Backend:** Publicado no Render: [URL do backend](https://SEU-BACKEND.onrender.com)
- **Frontend:** Publicado em Vercel/Netlify: [URL do frontend](https://SEU-FRONTEND.vercel.app)

### Variáveis de Ambiente no Render
- `OPENWEATHER_API_KEY` configurada na interface do Render (NUNCA coloque sua chave no código público)
- (Opcional) `PORT` pode ser configurada, mas o Render já define automaticamente

### Como rodar localmente (resumo)
1. Clone o repositório
2. Instale as dependências com `npm install`
3. Crie o arquivo `.env` com sua chave da OpenWeatherMap
4. Inicie o backend com `node js/server.js`
5. Abra o `index.html` no navegador para testar o frontend localmente

### Como testar o endpoint de previsão do tempo
- Acesse: `http://localhost:3000/api/previsao/Sao Paulo` (local)
- Acesse: `https://SEU-BACKEND.onrender.com/api/previsao/Sao Paulo` (deploy)
- Teste com cidades válidas e inválidas para ver o tratamento de erros

### Observações importantes
- O frontend deve consumir a URL pública do backend no Render (não localhost)
- O backend está preparado para CORS (permite requisições do frontend publicado)
- Todos os endpoints GET estão documentados acima

---

> **Dica:** Sempre confira os logs do Render após o deploy para garantir que não há erros de configuração ou variáveis de ambiente.

---

## Exemplo de Resposta (Dicas Gerais)
```json
[
  { "id": 1, "dica": "Verifique o nível do óleo do motor regularmente." },
  { "id": 2, "dica": "Calibre os pneus semanalmente para a pressão recomendada." }
]
```

## Contato
Dúvidas ou sugestões? Abra uma issue ou envie um pull request!
