// Inicialização e bindings
document.addEventListener('DOMContentLoaded', () => {
  // Form adicionar veículo
  const form = document.getElementById('form-add-veiculo');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const tipo = document.getElementById('veiculo-tipo').value;
    const placa = document.getElementById('veiculo-placa').value.trim();
    const modelo = document.getElementById('veiculo-modelo').value.trim();
    const cor = document.getElementById('veiculo-cor').value.trim();
    const imagem = document.getElementById('veiculo-imagem').value.trim();
    const extra = {};
    if (tipo === 'Carro') extra.portas = Number(document.getElementById('carro-portas').value) || 4;
    if (tipo === 'CarroEsportivo') extra.portas = Number(document.getElementById('carroesportivo-portas').value) || 2;
    if (tipo === 'Caminhao') { extra.eixos = Number(document.getElementById('caminhao-eixos').value) || 2; extra.capacidade = Number(document.getElementById('caminhao-capacidade').value) || 0; }
    const novo = { tipo, placa, modelo, cor, imagem, ...extra, status: { ligado: false, velocidade: 0 } };
    StorageAPI.add(novo);
    // try to post to backend
    fetch('/api/veiculos', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(novo) }).catch(()=>{});
    renderGarage();
    form.reset();
  });

  document.getElementById('btn-voltar-garagem').addEventListener('click', () => hideDetails());

  // Agendamento de manutenção
  document.getElementById('form-agendamento').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const placa = document.getElementById('agendamento-veiculo-placa').value;
    const data = document.getElementById('agenda-data').value;
    const tipo = document.getElementById('agenda-tipo').value;
    const custo = document.getElementById('agenda-custo').value;
    const descricao = document.getElementById('agenda-descricao').value;
    ManutencaoAPI.agendar({ placa, data, tipo, custo, descricao });
    alert('Agendamento salvo.');
  });

  // Variável global para armazenar dados da previsão
  let weatherData = null;

  // Função para renderizar previsão filtrada
  function renderWeather(filter = 'all') {
    const out = document.getElementById('previsao-tempo-resultado');
    if (!weatherData) return;
    const cityName = weatherData.city.name;
    out.innerHTML = `<h3>Previsão para ${cityName}</h3>`;
    let filteredList = weatherData.list;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (filter === 'hoje') {
      filteredList = weatherData.list.filter(day => {
        const dayDate = new Date(day.dt * 1000);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === today.getTime();
      });
    } else if (filter === 'amanha') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filteredList = weatherData.list.filter(day => {
        const dayDate = new Date(day.dt * 1000);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === tomorrow.getTime();
      });
    } else if (filter === '3dias') {
      const day3 = new Date(today);
      day3.setDate(day3.getDate() + 2);
      filteredList = weatherData.list.filter(day => {
        const dayDate = new Date(day.dt * 1000);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate <= day3;
      });
    }
    filteredList.forEach(day => {
      const date = new Date(day.dt * 1000).toLocaleDateString('pt-BR');
      const temp = Math.round(day.main.temp);
      const description = day.weather[0].description;
      const icon = day.weather[0].icon;
      const humidity = day.main.humidity;
      const windSpeed = day.wind.speed;
      const card = document.createElement('div');
      card.className = 'weather-card';
      card.innerHTML = `
        <h4>${date}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="weather-icon">
        <p class="temp">${temp}°C</p>
        <p class="desc">${description.charAt(0).toUpperCase() + description.slice(1)}</p>
        <div class="details">
          <span>Umidade: ${humidity}%</span>
          <span>Vento: ${windSpeed} m/s</span>
        </div>
      `;
      out.appendChild(card);
    });
  }

  // Previsão do tempo
  document.getElementById('verificar-clima-btn').addEventListener('click', async () => {
    const cidade = document.getElementById('destino-viagem').value.trim();
    if (!cidade) return alert('Digite uma cidade');
    const res = await fetch(`/api/previsao?cidade=${encodeURIComponent(cidade)}`);
    const data = await res.json();
    const out = document.getElementById('previsao-tempo-resultado');
    if (data.error) {
      out.innerHTML = `<p class="erro">Erro: ${data.error}</p>`;
      document.getElementById('previsao-filtros').style.display = 'none';
    } else {
      weatherData = data;
      document.getElementById('previsao-filtros').style.display = 'block';
      renderWeather('all');
    }
  });

  // Event listeners para filtros
  document.querySelectorAll('.btn-filtro-clima').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-periodo');
      renderWeather(filter);
    });
  });

  renderGarage();
});
