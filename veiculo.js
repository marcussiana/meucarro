// Classes de veículos simples para o frontend
class Veiculo {
  constructor({ tipo = 'Carro', placa = '', modelo = '', cor = '' } = {}) {
    this.tipo = tipo;
    this.placa = placa;
    this.modelo = modelo;
    this.cor = cor;
    this.status = { ligado: false, velocidade: 0 };
  }
  ligar() { this.status.ligado = true; }
  desligar() { this.status.ligado = false; this.status.velocidade = 0; }
  acelerar(delta = 10) { if (this.status.ligado) this.status.velocidade += delta; }
  buzinar() { return `${this.placa}: BEEP BEEP!`; }
}

class Carro extends Veiculo {
  constructor(opts) { super({ ...opts, tipo: 'Carro' }); this.portas = opts.portas || 4; }
}

class CarroEsportivo extends Carro {
  constructor(opts) { super({ ...opts, tipo: 'CarroEsportivo' }); this.turbo = opts.turbo || false; }
  toggleTurbo() { this.turbo = !this.turbo; }
}

class Caminhao extends Veiculo {
  constructor(opts) { super({ ...opts, tipo: 'Caminhao' }); this.eixos = opts.eixos || 2; this.capacidade = opts.capacidade || 0; this.carga = 0; }
  carregar(peso) { this.carga = Math.min(this.capacidade, this.carga + peso); }
  descarregar(peso) { this.carga = Math.max(0, this.carga - peso); }
}

window.Veiculo = Veiculo;
window.Carro = Carro;
window.CarroEsportivo = CarroEsportivo;
window.Caminhao = Caminhao;
