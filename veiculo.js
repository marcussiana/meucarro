// Frontend helper: Veiculo class
// This file provides a small Veiculo class used by the frontend scripts.
// It deliberately does NOT conflict with the server Mongoose model at models/Veiculo.js

/* eslint-disable no-unused-vars */
(function(global) {
  class Veiculo {
    constructor(data = {}) {
      this._id = data._id || data.id || null;
      this.placa = data.placa || '';
      this.modelo = data.modelo || '';
      this.cor = data.cor || '';
      this.imagem = data.imagem || '';
      this.tipo = data.tipo || 'Carro';
      this.portas = data.portas || null;
      this.eixos = data.eixos || null;
      this.capacidade = data.capacidade || null;
      this.status = data.status || { ligado: false, velocidade: 0 };
      this.carga = data.carga || 0;
      this.turbo = !!data.turbo;
      this.owner = data.owner || null; // may be populated with { email }
      this.sharedWith = Array.isArray(data.sharedWith) ? data.sharedWith.slice() : [];
    }

    toJSON() {
      return {
        _id: this._id,
        placa: this.placa,
        modelo: this.modelo,
        cor: this.cor,
        imagem: this.imagem,
        tipo: this.tipo,
        portas: this.portas,
        eixos: this.eixos,
        capacidade: this.capacidade,
        status: this.status,
        carga: this.carga,
        turbo: this.turbo,
        owner: this.owner,
        sharedWith: this.sharedWith
      };
    }

    static fromForm() {
      const tipo = document.getElementById('veiculo-tipo').value;
      const placa = document.getElementById('veiculo-placa').value.trim();
      const modelo = document.getElementById('veiculo-modelo').value.trim();
      const cor = document.getElementById('veiculo-cor').value.trim();
      const imagem = document.getElementById('veiculo-imagem').value.trim();
      const data = { tipo, placa, modelo, cor, imagem };
      if (tipo === 'Carro') data.portas = Number(document.getElementById('carro-portas').value) || 4;
      if (tipo === 'CarroEsportivo') data.portas = Number(document.getElementById('carroesportivo-portas').value) || 2;
      if (tipo === 'Caminhao') {
        data.eixos = Number(document.getElementById('caminhao-eixos').value) || 2;
        data.capacidade = Number(document.getElementById('caminhao-capacidade').value) || 0;
      }
      return new Veiculo(data);
    }

    // Useful for debugging
    toString() { return `${this.modelo} (${this.placa})`; }
  }

  // Expose to global for non-module frontend scripts
  global.Veiculo = Veiculo;
})(window);
