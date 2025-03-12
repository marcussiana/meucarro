// script.js

// ============================================================================
// Classe Carro (Classe Base)
// ============================================================================

class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    ligar() {
        this.ligado = true;
        somLigar.currentTime = 0;
        somLigar.play();
        return "Ligado!";
    }

    desligar() {
        this.ligado = false;
        this.velocidade = 0;
        return "Desligado!";
    }

    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            somAcelerar.currentTime = 0;
            somAcelerar.play();
            return `Acelerando! Velocidade atual: ${this.velocidade} km/h`;
        } else {
            return "Precisa estar ligado para acelerar.";
        }
    }

    frear(decremento) {
        if (this.ligado) {
            this.velocidade -= decremento;
            if (this.velocidade < 0) {
                this.velocidade = 0;
            }
            somFrear.currentTime = 0;
            somFrear.play();
            return `Freando! Velocidade atual: ${this.velocidade} km/h`;
        } else {
            return "Precisa estar ligado para frear.";
        }
    }
}

// ============================================================================
// Classe Caminhao (Herda de Carro)
// ============================================================================

class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor); // Chama o construtor da classe Carro
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(peso) {
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            return `Caminhão carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg`;
        } else {
            return "Carga excede a capacidade do caminhão.";
        }
    }

    descarregar(peso) {
        if (this.cargaAtual - peso >= 0) {
            this.cargaAtual -= peso;
            return `Caminhão descarregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg`;
        } else {
            return "Não é possível descarregar mais peso do que o carregado.";
        }
    }
}

// ============================================================================
// Criando Objetos Carro e Caminhao
// ============================================================================

const meuCarro = new Carro("Fusca", "Azul");
const meuCaminhao = new Caminhao("Volvo FH", "Branco", 20000);

// ============================================================================
// Acessando Elementos HTML (Carro)
// ============================================================================

const statusCarroElement = document.getElementById("statusCarro");
const velocidadeCarroElement = document.getElementById("velocidadeCarro");
const botaoLigarCarro = document.getElementById("botaoLigarCarro");
const botaoDesligarCarro = document.getElementById("botaoDesligarCarro");
const botaoAcelerarCarro = document.getElementById("botaoAcelerarCarro");
const botaoFrearCarro = document.getElementById("botaoFrearCarro");


// ============================================================================
// Acessando Elementos HTML (Caminhao)
// ============================================================================

const statusCaminhaoElement = document.getElementById("statusCaminhao");
const velocidadeCaminhaoElement = document.getElementById("velocidadeCaminhao");
const botaoLigarCaminhao = document.getElementById("botaoLigarCaminhao");
const botaoDesligarCaminhao = document.getElementById("botaoDesligarCaminhao");
const botaoAcelerarCaminhao = document.getElementById("botaoAcelerarCaminhao");
const botaoFrearCaminhao = document.getElementById("botaoFrearCaminhao");

// ============================================================================
// Funções para atualizar a interface (Carro)
// ============================================================================

function atualizarStatusCarro() {
    statusCarroElement.textContent = `Status: ${meuCarro.ligado ? "Ligado" : "Desligado"}`;
    velocidadeCarroElement.textContent = `Velocidade: ${meuCarro.velocidade} km/h`;
}

// ============================================================================
// Funções para atualizar a interface (Caminhao)
// ============================================================================

function atualizarStatusCaminhao() {
    statusCaminhaoElement.textContent = `Status: ${meuCaminhao.ligado ? "Ligado" : "Desligado"}`;
    velocidadeCaminhaoElement.textContent = `Velocidade: ${meuCaminhao.velocidade} km/h`;
}


// ============================================================================
// Adicionando Event Listeners (Carro)
// ============================================================================

botaoLigarCarro.addEventListener("click", function() {
    meuCarro.ligar();
    atualizarStatusCarro();
});

botaoDesligarCarro.addEventListener("click", function() {
    meuCarro.desligar();
    atualizarStatusCarro();
});

botaoAcelerarCarro.addEventListener("click", function() {
    meuCarro.acelerar(10);
    atualizarStatusCarro();
});

botaoFrearCarro.addEventListener("click", function() {
    meuCarro.frear(10);
    atualizarStatusCarro();
});


// ============================================================================
// Adicionando Event Listeners (Caminhao)
// ============================================================================

botaoLigarCaminhao.addEventListener("click", function() {
    meuCaminhao.ligar();
    atualizarStatusCaminhao();
});

botaoDesligarCaminhao.addEventListener("click", function() {
    meuCaminhao.desligar();
    atualizarStatusCaminhao();
});

botaoAcelerarCaminhao.addEventListener("click", function() {
    meuCaminhao.acelerar(10);
    atualizarStatusCaminhao();
});

botaoFrearCaminhao.addEventListener("click", function() {
    meuCaminhao.frear(10);
    atualizarStatusCaminhao();
});



// ============================================================================
// Inicialização
// ============================================================================

atualizarStatusCarro();
atualizarStatusCaminhao();