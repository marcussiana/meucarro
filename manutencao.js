// Simple maintenance scheduler stored via StorageAPI
const ManutencaoAPI = (function () {
  const key = 'garagem_manutencao_v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }

  function write(arr) { try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {} }

  function listaPorPlaca(placa) { return read().filter(i => i.placa === placa); }
  function agendar({ placa, data, tipo, custo, descricao }) {
    const arr = read();
    const item = { id: Date.now(), placa, data, tipo, custo: Number(custo || 0), descricao };
    arr.push(item); write(arr); return item;
  }

  return { listaPorPlaca, agendar };
})();

window.ManutencaoAPI = ManutencaoAPI;
