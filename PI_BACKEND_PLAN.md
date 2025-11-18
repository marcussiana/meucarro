# PI_BACKEND_PLAN.md

## Entidade escolhida
- Nome: Veículo

## Justificativa
O projeto já gira em torno de uma "Garagem Inteligente" — a entidade Veículo é central e será usada como exemplo do PI dinâmico.

## Schema Mongoose (Veiculo)
```js
const VeiculoSchema = new Schema({
  placa: { type: String, required: true, unique: true },
  modelo: { type: String, required: true },
  cor: { type: String },
  imagem: { type: String },
  tipo: { type: String, enum: ['Carro','CarroEsportivo','Caminhao'], default: 'Carro' },
  portas: { type: Number },
  eixos: { type: Number },
  capacidade: { type: Number },
  status: {
    ligado: { type: Boolean, default: false },
    velocidade: { type: Number, default: 0 }
  },
  carga: { type: Number, default: 0 },
  turbo: { type: Boolean, default: false }
}, { timestamps: true });
```

## Endpoints da API para `/api/veiculos`
- `GET /api/veiculos` — listar todos os veículos
- `POST /api/veiculos` — criar novo veículo
- `GET /api/veiculos/:id` — obter detalhe por id
- `PUT /api/veiculos/:id` — atualizar veículo
- `DELETE /api/veiculos/:id` — deletar veículo

Observações:
- Responder com status apropriados (201 para criação, 404 para não encontrado, 400 para request inválido).
- Proteger rotas de escrita com autenticação (fase opcional com JWT).

## Integração com Frontend
- O frontend fará `fetch('/api/veiculos')` para carregar a lista e `POST`/`PUT`/`DELETE` para alterar.
- Cada veículo retornará o campo `_id` gerado pelo MongoDB — o frontend deve usar esse identificador para operações posteriores.

## Deploy / Ambiente
- Usar variável de ambiente `MONGODB_URI` para conexão ao MongoDB.
- Em desenvolvimento, tentar conectar em `mongodb://localhost:27017/garagem_conectada_db` como fallback.
