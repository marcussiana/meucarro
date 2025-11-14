const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory store of vehicles (fallback when no DB configured)
let vehicles = [];
const dadosPath = './dados_veiculos_api.json';
try {
  const data = require(dadosPath);
  if (Array.isArray(data)) vehicles = data;
} catch (e) {
  // ignore if file missing or invalid
}

// Helpers
function findIndexByPlaca(placa) {
  return vehicles.findIndex(v => v.placa === placa);
}

// Listar veículos
router.get('/', (req, res) => {
  res.json(vehicles);
});

// Adicionar veículo
router.post('/', (req, res) => {
  const v = req.body;
  if (!v || !v.placa) return res.status(400).json({ error: 'Veículo inválido (falta placa)' });
  if (findIndexByPlaca(v.placa) !== -1) return res.status(409).json({ error: 'Placa já existe' });
  vehicles.push(v);
  return res.status(201).json(v);
});

// Deletar por placa
router.delete('/:placa', (req, res) => {
  const placa = req.params.placa;
  const idx = findIndexByPlaca(placa);
  if (idx === -1) return res.status(404).json({ error: 'Veículo não encontrado' });
  const removed = vehicles.splice(idx, 1)[0];
  res.json(removed);
});

// Previsão do tempo (usa OPENWEATHER_API_KEY no .env) - 5 dias
router.get('/previsao', async (req, res) => {
  const cidade = req.query.cidade || req.params.cidade || 'Sao Paulo';
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenWeather API key not configured in .env' });
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { q: cidade, appid: apiKey, units: 'metric', lang: 'pt_br' }
    });
    // Group by day and take the forecast closest to noon for each day
    const dailyForecasts = [];
    const groupedByDate = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(item);
    });
    Object.keys(groupedByDate).slice(0, 5).forEach(date => {
      const items = groupedByDate[date];
      // Find the item closest to 12:00
      let closest = items[0];
      let minDiff = Math.abs(new Date(closest.dt * 1000).getHours() - 12);
      items.forEach(item => {
        const hour = new Date(item.dt * 1000).getHours();
        const diff = Math.abs(hour - 12);
        if (diff < minDiff) {
          minDiff = diff;
          closest = item;
        }
      });
      dailyForecasts.push({
        dt: closest.dt,
        main: closest.main,
        weather: closest.weather,
        wind: closest.wind,
        dt_txt: closest.dt_txt
      });
    });
    const adapted = { list: dailyForecasts, city: response.data.city };
    res.json(adapted);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message;
    res.status(status).json({ error: message });
  }
});

module.exports = router;
