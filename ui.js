// UI functions: render garage, bind events
function renderGarage() {
  const listEl = document.getElementById('lista-garagem');
  const veiculos = StorageAPI.list();
  if (!veiculos || veiculos.length === 0) { listEl.innerHTML = '<p>Nenhum veículo na garagem.</p>'; return; }
  listEl.innerHTML = '';
  veiculos.forEach(v => {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    const imgHtml = v.imagem ? `<img src="${v.imagem}" alt="${v.modelo}" class="vehicle-img">` : `<div class="vehicle-img-placeholder">Sem foto</div>`;
    const btnDiv = document.createElement('div');
    btnDiv.className = 'vehicle-card-actions';
    
    const btn = document.createElement('button');
    btn.textContent = 'Ver';
    btn.addEventListener('click', () => showDetails(v.placa));
    
    const del = document.createElement('button');
    del.textContent = 'Remover';
    del.className = 'btn-del';
    del.addEventListener('click', async () => {
      StorageAPI.removeByPlaca(v.placa);
      try { await fetch(`/api/veiculos/${v.placa}`, { method: 'DELETE' }); } catch (e) {}
      renderGarage();
    });
    
    btnDiv.appendChild(btn);
    btnDiv.appendChild(del);
    
    card.innerHTML = imgHtml + `<div class="vehicle-card-info"><strong>${v.modelo}</strong><br>${v.placa}<br>${v.cor}</div>`;
    card.appendChild(btnDiv);
    listEl.appendChild(card);
  });
}

function showDetails(placa) {
  const veiculos = StorageAPI.list();
  const v = veiculos.find(x => x.placa === placa);
  if (!v) return alert('Veículo não encontrado');
  document.getElementById('detalhes-veiculo-section').style.display = 'block';
  document.getElementById('garage-section').style.display = 'none';
  document.getElementById('detalhes-veiculo-titulo').textContent = `Detalhes — ${v.modelo} (${v.placa})`;
  document.getElementById('agendamento-veiculo-placa').value = v.placa;
  const statusEl = document.getElementById('detalhes-veiculo-status');
  statusEl.textContent = `Ligado: ${v.status?.ligado ? 'Sim' : 'Não'} — Velocidade: ${v.status?.velocidade || 0}`;
  // Mostrar imagem se existir
  const imgEl = document.getElementById('detail-img');
  if (v.imagem) { imgEl.src = v.imagem; imgEl.style.display = 'block'; } else { imgEl.style.display = 'none'; }
  // show/hide buttons
  document.getElementById('btn-detail-turbo').style.display = v.tipo === 'CarroEsportivo' ? 'inline-block' : 'none';
  document.getElementById('btn-detail-carregar').style.display = v.tipo === 'Caminhao' ? 'inline-block' : 'none';
  document.getElementById('btn-detail-descarregar').style.display = v.tipo === 'Caminhao' ? 'inline-block' : 'none';
}

function hideDetails() {
  document.getElementById('detalhes-veiculo-section').style.display = 'none';
  document.getElementById('garage-section').style.display = 'block';
}

window.renderGarage = renderGarage;
window.showDetails = showDetails;
window.hideDetails = hideDetails;
