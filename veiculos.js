const express = require('express');
const axios = require('axios');
const router = express.Router();
const Veiculo = require('./models/Veiculo');
const User = require('./models/User');
const auth = require('./middleware/auth');

// Rota de previsão do tempo (usa OPENWEATHER_API_KEY no .env) - retorna formato adaptado
// Keep this route before /:id to avoid conflicts
router.get('/previsao', async (req, res) => {
  const cidade = req.query.cidade || req.params.cidade || 'Sao Paulo';
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenWeather API key not configured in .env' });
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: cidade, appid: apiKey, units: 'metric', lang: 'pt_br' }
    });
    const adapted = { list: [response.data], city: response.data && { name: response.data.name } };
    res.json(adapted);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message;
    res.status(status).json({ error: message });
  }
});

// GET /api/veiculos - listar veículos do usuário (próprios + compartilhados)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const veiculos = await Veiculo.find({
      $or: [ { owner: userId }, { sharedWith: userId } ]
    }).sort({ createdAt: -1 }).populate('owner', 'email').lean();
    res.json(veiculos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/veiculos - criar (protegido)
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.placa) return res.status(400).json({ error: 'Veículo inválido (falta placa)' });
    const exists = await Veiculo.findOne({ placa: data.placa });
    if (exists) return res.status(409).json({ error: 'Placa já existe' });
    data.owner = req.userId;
    const novo = await Veiculo.create(data);
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/veiculos/:id - detalhes (protege visualização: owner OR sharedWith)
router.get('/:id', auth, async (req, res) => {
  try {
    const v = await Veiculo.findById(req.params.id).populate('owner', 'email').lean();
    if (!v) return res.status(404).json({ error: 'Veículo não encontrado' });
    const userId = req.userId;
    const ownerId = v.owner?._id?.toString();
    const shared = Array.isArray(v.sharedWith) && v.sharedWith.map(x=>x.toString()).includes(userId);
    if (ownerId !== userId && !shared) return res.status(403).json({ error: 'Acesso negado ao veículo' });
    res.json(v);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/veiculos/:id - atualizar (apenas owner pode alterar)
router.put('/:id', auth, async (req, res) => {
  try {
    const data = req.body;
    const v = await Veiculo.findById(req.params.id);
    if (!v) return res.status(404).json({ error: 'Veículo não encontrado' });
    if (v.owner && v.owner.toString() !== req.userId) return res.status(403).json({ error: 'Apenas o proprietário pode editar' });
    Object.assign(v, data);
    await v.save();
    res.json(v.toObject());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/veiculos/:id - deletar (apenas owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const v = await Veiculo.findById(req.params.id);
    if (!v) return res.status(404).json({ error: 'Veículo não encontrado' });
    if (v.owner && v.owner.toString() !== req.userId) return res.status(403).json({ error: 'Apenas o proprietário pode deletar' });
    await v.remove();
    res.json({ message: 'Veículo removido' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/veiculos/:id/share - compartilhar veículo com outro usuário (por email)
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email necessário para compartilhamento' });
    const v = await Veiculo.findById(req.params.id);
    if (!v) return res.status(404).json({ error: 'Veículo não encontrado' });
    if (!v.owner || v.owner.toString() !== req.userId) return res.status(403).json({ error: 'Apenas o proprietário pode compartilhar este veículo' });
    const u = await User.findOne({ email: email.toLowerCase().trim() });
    if (!u) return res.status(404).json({ error: 'Usuário para compartilhamento não encontrado' });
    const uid = u._id;
    v.sharedWith = v.sharedWith || [];
    if (!v.sharedWith.map(x=>x.toString()).includes(uid.toString())) v.sharedWith.push(uid);
    await v.save();
    res.json({ message: 'Veículo compartilhado com sucesso' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Previsão do tempo (usa OPENWEATHER_API_KEY no .env) - retorna formato adaptado
router.get('/previsao', async (req, res) => {
  const cidade = req.query.cidade || req.params.cidade || 'Sao Paulo';
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenWeather API key not configured in .env' });
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: cidade, appid: apiKey, units: 'metric', lang: 'pt_br' }
    });
    const adapted = { list: [response.data], city: response.data && { name: response.data.name } };
    res.json(adapted);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message;
    res.status(status).json({ error: message });
  }
});

module.exports = router;
