// Simple storage wrapper using localStorage with in-memory fallback
const StorageAPI = (function () {
  const key = 'garagem_veiculos_v1';
  let memory = null;

  function read() {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    if (memory) return memory;
    return [];
  }

  function write(data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { memory = data; }
  }

  function list() { return read(); }
  function add(v) { const arr = read(); arr.push(v); write(arr); return v; }
  function removeByPlaca(placa) { const arr = read(); const idx = arr.findIndex(x => x.placa === placa); if (idx === -1) return null; const r = arr.splice(idx,1)[0]; write(arr); return r; }
  function update(placa, data) { const arr = read(); const idx = arr.findIndex(x => x.placa === placa); if (idx === -1) return null; arr[idx] = { ...arr[idx], ...data }; write(arr); return arr[idx]; }

  return { list, add, removeByPlaca, update };
})();

window.StorageAPI = StorageAPI;
