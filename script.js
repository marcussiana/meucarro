// Definição da Classe Carro
class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    ligar() {
        this.ligado = true;
        somLigar.currentTime = 0; // Garante que o som comece do início
        somLigar.play();
        return "Carro ligado!";
    }

    desligar() {
        this.ligado = false;
        this.velocidade = 0;
        return "Carro desligado!";
    }

    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            somAcelerar.currentTime = 0; // Garante que o som comece do início
            somAcelerar.play();
            return `Acelerando! Velocidade atual: ${this.velocidade} km/h`;
        } else {
            return "O carro precisa estar ligado para acelerar.";
        }
    }

    frear(decremento) {
        if (this.ligado) {
            this.velocidade -= decremento;
            if (this.velocidade < 0) {
                this.velocidade = 0;
            }
            somFrear.currentTime = 0; // Garante que o som comece do início
            somFrear.play();
            return `Freando! Velocidade atual: ${this.velocidade} km/h`;
        } else {
            return "O carro precisa estar ligado para frear.";
        }
    }
}

// Criando um Objeto Carro
const meuCarro = new Carro("Fusca", "Azul");

// Acessando elementos HTML
const statusCarroElement = document.getElementById("statusCarro");
const velocidadeCarroElement = document.getElementById("velocidadeCarro");
const botaoLigar = document.getElementById("botaoLigar");
const botaoDesligar = document.getElementById("botaoDesligar");
const botaoAcelerar = document.getElementById("botaoAcelerar");
const botaoFrear = document.getElementById("botaoFrear");
const somLigar = document.getElementById("somLigar");
const somAcelerar = document.getElementById("somAcelerar");
const somFrear = document.getElementById("somFrear");

// Funções para atualizar a interface
function atualizarStatus() {
    statusCarroElement.textContent = `Status: ${meuCarro.ligado ? "Ligado" : "Desligado"}`;
    velocidadeCarroElement.textContent = `Velocidade: ${meuCarro.velocidade} km/h`;
}

// Adicionando Event Listeners (Ouvintes de Evento)
botaoLigar.addEventListener("click", function() {
    meuCarro.ligar();
    atualizarStatus();
});

botaoDesligar.addEventListener("click", function() {
    meuCarro.desligar();
    atualizarStatus();
});

botaoAcelerar.addEventListener("click", function() {
    meuCarro.acelerar(10);
    atualizarStatus();
});

botaoFrear.addEventListener("click", function() {
    meuCarro.frear(10);
    atualizarStatus();
});

// Inicialização
atualizarStatus();