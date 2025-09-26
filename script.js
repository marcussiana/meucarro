// --- CLASSE BASE: Veiculo ---
class Veiculo {
    constructor(modelo, cor, somBuzina, imagemSrc, maxVelocidade) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
        this.somBuzina = somBuzina;
        this.imagemSrc = imagemSrc;
        this.maxVelocidade = maxVelocidade; // Velocidade máxima do veículo
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            this.velocidade = 0;
            console.log(`${this.modelo} ligado!`);
            reproduzirSom('ligar');
            return { success: true, message: `${this.modelo} ligado!` };
        } else {
            const msg = `O ${this.modelo} já está ligado.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this.velocidade = 0;
            console.log(`${this.modelo} desligado!`);
            reproduzirSom('desligar');
            return { success: true, message: `${this.modelo} desligado!` };
        } else {
            const msg = `O ${this.modelo} já está desligado.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
    }

    acelerar() {
        if (!this.ligado) {
            const msg = `Ligue o ${this.modelo} primeiro para acelerar!`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (this.velocidade >= this.maxVelocidade) {
            const msg = `${this.modelo} já está na velocidade máxima (${this.maxVelocidade} km/h)!`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }

        this.velocidade += 10;
        if (this.velocidade > this.maxVelocidade) {
            this.velocidade = this.maxVelocidade;
        }
        console.log(`${this.modelo} acelerando! Velocidade atual: ${this.velocidade} km/h`);
        reproduzirSom('acelerar');
        return { success: true, message: `${this.modelo} acelerando!` };
    }

    frear() {
        if (!this.ligado) {
            const msg = `O ${this.modelo} está desligado, não é possível frear.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (this.velocidade === 0) {
            const msg = `${this.modelo} já está parado.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }

        this.velocidade -= 10;
        if (this.velocidade < 0) this.velocidade = 0;
        console.log(`${this.modelo} freando! Velocidade atual: ${this.velocidade} km/h`);
        reproduzirSom('frear');
        return { success: true, message: `${this.modelo} freando!` };
    }

    buzinar() {
        console.log(`${this.modelo} faz: ${this.somBuzina}`);
        reproduzirSom('buzina');
        return { success: true, message: `${this.modelo} buzinou: ${this.somBuzina}` };
    }

    exibirInformacoes() {
        let info = `
            <img src="${this.imagemSrc}" alt="${this.modelo}" class="${this.ligado ? 'ligado' : ''}">
            <p><strong>Modelo:</strong> <span>${this.modelo}</span></p>
            <p><strong>Cor:</strong> <span>${this.cor}</span></p>
            <p><strong>Status:</strong> <span style="color: ${this.ligado ? 'green' : 'red'};">${this.ligado ? "Ligado" : "Desligado"}</span></p>
            <p><strong>Velocidade:</strong> <span>${this.velocidade.toFixed(0)}</span> km/h (Max: ${this.maxVelocidade} km/h)</p>
            <p><strong>Som da Buzina:</strong> <span>${this.somBuzina}</span></p>
        `;
        return info;
    }
}

// --- CLASSE FILHA: Carro (herda de Veiculo) ---
class Carro extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor, "Biii Biip!", "img/carro.png", 180); // Max 180 km/h
    }
}

// --- CLASSE FILHA: CarroEsportivo (herda de Carro) ---
class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.turboAtivado = false;
        this.somBuzina = "VRUUUM PIII!";
        this.imagemSrc = "img/carro_esportivo.png";
        this.maxVelocidade = 300; // Max 300 km/h
    }

    ativarTurbo() {
        if (!this.ligado) {
            const msg = `Ligue o ${this.modelo} primeiro para ativar o turbo!`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (this.turboAtivado) {
            const msg = `O turbo do ${this.modelo} já está ativado.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (this.velocidade >= this.maxVelocidade) {
            const msg = `${this.modelo} já está na velocidade máxima, não é possível ativar o turbo.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }

        this.turboAtivado = true;
        this.velocidade += 50;
        if (this.velocidade > this.maxVelocidade) {
            this.velocidade = this.maxVelocidade;
        }
        console.log(`${this.modelo} - TURBO ATIVADO! Velocidade: ${this.velocidade} km/h`);
        reproduzirSom('acelerar'); // Som de aceleração mais intensa
        return { success: true, message: `${this.modelo} - TURBO ATIVADO!` };
    }

    desativarTurbo() {
        if (!this.ligado) {
            const msg = `Ligue o ${this.modelo} primeiro.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (!this.turboAtivado) {
            const msg = `O turbo do ${this.modelo} já está desativado.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }

        this.turboAtivado = false;
        // Opcional: reduzir a velocidade ao desativar o turbo se ela estiver muito alta
        // if (this.velocidade > this.maxVelocidade / 2 && this.velocidade > 100) this.velocidade -= 30;
        console.log(`${this.modelo} - Turbo desativado.`);
        return { success: true, message: `${this.modelo} - Turbo desativado.` };
    }

    acelerar() {
        if (!this.ligado) {
            const msg = `Ligue o ${this.modelo} primeiro para acelerar!`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (this.velocidade >= this.maxVelocidade) {
            const msg = `${this.modelo} já está na velocidade máxima (${this.maxVelocidade} km/h)!`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }

        if (this.turboAtivado) {
            this.velocidade += 25;
        } else {
            this.velocidade += 15;
        }
        if (this.velocidade > this.maxVelocidade) {
            this.velocidade = this.maxVelocidade;
        }
        console.log(`${this.modelo} acelerando! Velocidade actual: ${this.velocidade} km/h`);
        reproduzirSom('acelerar');
        return { success: true, message: `${this.modelo} acelerando!` };
    }

    exibirInformacoes() {
        let infoBase = super.exibirInformacoes();
        let infoEsportivo = `
            <p><strong>Turbo:</strong> <span style="color: ${this.turboAtivado ? 'green' : 'gray'};">${this.turboAtivado ? "Ativado" : "Desativado"}</span></p>
        `;
        return infoBase + infoEsportivo;
    }
}

// --- CLASSE FILHA: Caminhao (herda de Veiculo) ---
class Caminhao extends Veiculo {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor, "FOOOOON Fooooon!", "img/caminhao.png", 120); // Max 120 km/h
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(pesoKg) {
        if (!this.ligado) {
            const msg = `O ${this.modelo} precisa estar ligado para carregar.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (this.cargaAtual + pesoKg <= this.capacidadeCarga) {
            this.cargaAtual += pesoKg;
            console.log(`Caminhão carregado com ${pesoKg} kg. Carga total: ${this.cargaAtual} kg.`);
            return { success: true, message: `Carregado com ${pesoKg} kg.` };
        } else {
            const pesoExcedente = (this.cargaAtual + pesoKg) - this.capacidadeCarga;
            const msg = `Capacidade máxima excedida em ${pesoExcedente.toFixed(0)} kg! Não foi possível adicionar ${pesoKg} kg.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
    }

    descarregar(pesoKg) {
        if (!this.ligado) {
            const msg = `O ${this.modelo} precisa estar ligado para descarregar.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (this.cargaAtual - pesoKg >= 0) {
            this.cargaAtual -= pesoKg;
            console.log(`Caminhão descarregado em ${pesoKg} kg. Carga total: ${this.cargaAtual} kg.`);
            return { success: true, message: `Descarregado em ${pesoKg} kg.` };
        } else {
            const msg = `Não é possível descarregar ${pesoKg} kg. Carga atual é de ${this.cargaAtual} kg.`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
    }

    acelerar() {
        if (!this.ligado) {
            const msg = `Ligue o ${this.modelo} primeiro para acelerar!`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }
        if (this.velocidade >= this.maxVelocidade) {
            const msg = `${this.modelo} já está na velocidade máxima (${this.maxVelocidade} km/h)!`;
            console.log(msg);
            exibirAlerta(msg);
            return { success: false, message: msg };
        }

        const fatorCarga = 1 - (this.cargaAtual / this.capacidadeCarga) * 0.5;
        this.velocidade += (5 * fatorCarga);
        if (this.velocidade > this.maxVelocidade) {
            this.velocidade = this.maxVelocidade;
        }
        console.log(`${this.modelo} (com carga: ${this.cargaAtual}kg) acelerando! Velocidade atual: ${this.velocidade.toFixed(0)} km/h`);
        reproduzirSom('acelerar');
        return { success: true, message: `${this.modelo} acelerando!` };
    }

    exibirInformacoes() {
        let infoBase = super.exibirInformacoes();
        let infoCaminhao = `
            <p><strong>Capacidade de Carga:</strong> <span>${this.capacidadeCarga}</span> kg</p>
            <p><strong>Carga Atual:</strong> <span>${this.cargaAtual}</span> kg</p>
        `;
        return infoBase + infoCaminhao;
    }
}

// --- CLASSE GARAGEM ---
class Garagem {
    constructor() {
        this.veiculos = [];
        this.veiculoSelecionado = null;
    }

    adicionarVeiculo(veiculo) {
        this.veiculos.push(veiculo);
    }

    selecionarVeiculo(modelo) {
        this.veiculoSelecionado = this.veiculos.find(v => v.modelo === modelo);
        if (this.veiculoSelecionado) {
            console.log(`Veículo selecionado: ${this.veiculoSelecionado.modelo}`);
        } else {
            console.log(`Veículo com modelo "${modelo}" não encontrado.`);
        }
        return this.veiculoSelecionado;
    }

    interagir(acao, valor = null) {
        if (!this.veiculoSelecionado) {
            exibirAlerta("Nenhum veículo selecionado na garagem.");
            return;
        }

        let resultado = { success: false, message: "Ação não reconhecida ou inválida." };
        let veiculo = this.veiculoSelecionado;

        switch (acao) {
            case "ligar":
                resultado = veiculo.ligar();
                break;
            case "desligar":
                resultado = veiculo.desligar();
                break;
            case "acelerar":
                resultado = veiculo.acelerar();
                break;
            case "frear":
                resultado = veiculo.frear();
                break;
            case "buzinar":
                resultado = veiculo.buzinar();
                break;
            case "ativarTurbo":
                if (veiculo instanceof CarroEsportivo) {
                    resultado = veiculo.ativarTurbo();
                } else {
                    resultado.message = `Ação "ativarTurbo" não aplicável a ${veiculo.modelo}.`;
                    exibirAlerta(resultado.message);
                }
                break;
            case "desativarTurbo":
                if (veiculo instanceof CarroEsportivo) {
                    resultado = veiculo.desativarTurbo();
                } else {
                    resultado.message = `Ação "desativarTurbo" não aplicável a ${veiculo.modelo}.`;
                    exibirAlerta(resultado.message);
                }
                break;
            case "carregar":
                if (veiculo instanceof Caminhao) {
                    if (valor !== null) {
                        resultado = veiculo.carregar(valor);
                    } else {
                        resultado.message = "É necessário um valor para carregar o caminhão.";
                        exibirAlerta(resultado.message);
                    }
                } else {
                    resultado.message = `Ação "carregar" não aplicável a ${veiculo.modelo}.`;
                    exibirAlerta(resultado.message);
                }
                break;
            default:
                exibirAlerta(resultado.message);
        }
        atualizarDisplayGaragem();
        return resultado;
    }
}

// --- INSTANCIANDO OBJETOS E GARAGEM ---
const minhaGaragem = new Garagem();
minhaGaragem.adicionarVeiculo(new Carro("Civic", "Prata"));
minhaGaragem.adicionarVeiculo(new CarroEsportivo("Ferrari", "Vermelha"));
minhaGaragem.adicionarVeiculo(new Caminhao("Volvo FH", "Branco", 15000));

// --- OBTENDO ELEMENTOS HTML ---
const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
const velocimetroBarra = document.getElementById("velocimetroBarra");
const velocimetroTexto = document.getElementById("velocimetroTexto");
const customAlert = document.getElementById("customAlert");
const alertMessage = document.getElementById("alertMessage");
const closeAlertButton = document.getElementById("closeAlert");

const btnSelecionarCarroPadrao = document.getElementById("btnSelecionarCarroPadrao");
const btnSelecionarCarroEsportivo = document.getElementById("btnSelecionarCarroEsportivo");
const btnSelecionarCaminhao = document.getElementById("btnSelecionarCaminhao");
const botoesSelecao = [btnSelecionarCarroPadrao, btnSelecionarCarroEsportivo, btnSelecionarCaminhao];

const btnLigarGaragem = document.getElementById("btnLigarGaragem");
const btnDesligarGaragem = document.getElementById("btnDesligarGaragem");
const btnAcelerarGaragem = document.getElementById("btnAcelerarGaragem");
const btnFrearGaragem = document.getElementById("btnFrearGaragem");
const btnBuzinarGaragem = document.getElementById("btnBuzinarGaragem");
const btnAtivarTurboGaragem = document.getElementById("btnAtivarTurboGaragem");
const btnDesativarTurboGaragem = document.getElementById("btnDesativarTurboGaragem");
const inputCargaGaragem = document.getElementById("inputCargaGaragem");
const btnCarregarGaragem = document.getElementById("btnCarregarGaragem");
const cargaControleDiv = document.querySelector(".carga-controle.especifico-caminhao");
const botoesEspecificosEsportivo = document.querySelectorAll(".especifico-esportivo");

// --- ÁUDIOS ---
const audioBuzinaCarro = document.getElementById("audioBuzinaCarro");
const audioBuzinaEsportivo = document.getElementById("audioBuzinaEsportivo");
const audioBuzinaCaminhao = document.getElementById("audioBuzinaCaminhao");
const audioLigar = document.getElementById("audioLigar");
const audioDesligar = document.getElementById("audioDesligar");
const audioAcelerar = document.getElementById("audioAcelerar");
const audioFrear = document.getElementById("audioFrear");

function reproduzirSom(tipoSom) {
    let audio;
    const veiculo = minhaGaragem.veiculoSelecionado;

    switch (tipoSom) {
        case 'ligar': audio = audioLigar; break;
        case 'desligar': audio = audioDesligar; break;
        case 'acelerar': audio = audioAcelerar; break;
        case 'frear': audio = audioFrear; break;
        case 'buzina':
            if (veiculo instanceof CarroEsportivo) audio = audioBuzinaEsportivo;
            else if (veiculo instanceof Caminhao) audio = audioBuzinaCaminhao;
            else audio = audioBuzinaCarro; // Carro padrão
            break;
        default: return;
    }

    if (audio) {
        audio.currentTime = 0; // Reinicia o som se já estiver tocando
        audio.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
    }
}


// --- FUNÇÕES DE FEEDBACK E ALERTA ---
function exibirAlerta(mensagem) {
    alertMessage.textContent = mensagem;
    customAlert.style.display = 'flex';
}

closeAlertButton.addEventListener('click', () => {
    customAlert.style.display = 'none';
});

function atualizarVelocimetro() {
    const veiculo = minhaGaragem.veiculoSelecionado;
    if (veiculo && veiculo.ligado) {
        const percent = (veiculo.velocidade / veiculo.maxVelocidade) * 100;
        velocimetroBarra.style.width = `${percent}%`;