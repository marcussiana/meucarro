// js/Veiculo.js
import { Manutencao } from './Manutencao.js';
// import { exibirStatusMessage } from './utils.js'; // Descomente se quiser usar o utils.js globalmente

/**
 * Classe base para representar um veículo genérico na garagem.
 * @class Veiculo
 */
export class Veiculo {
    /**
     * Identificador do tipo de veículo (usado para seletores de UI).
     * @type {string}
     * @protected
     */
    _tipoVeiculo;

    /**
     * Cria uma instância de Veiculo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     * @param {string} tipoVeiculo - Identificador do tipo de veículo (ex: 'carro', 'moto').
     * @param {number} [velocidadeMaxima=180] - A velocidade máxima do veículo em km/h.
     */
    constructor(modelo, cor, tipoVeiculo, velocidadeMaxima = 180) {
        if (!modelo || !cor || !tipoVeiculo) {
            throw new Error("Modelo, cor e tipo do veículo são obrigatórios.");
        }
        this.modelo = modelo;
        this.cor = cor;
        this._tipoVeiculo = tipoVeiculo; // Usado para interagir com elementos HTML específicos
        this.ligado = false;
        this.velocidade = 0;
        this.velocidadeMaxima = velocidadeMaxima;
        /** @type {Manutencao[]} */
        this.historicoManutencao = [];

        this.uiUpdater = null; // Será injetado pela classe Garagem
    }

    /**
     * Define o atualizador da UI para este veículo.
     * @param {function} updater - Função que será chamada para atualizar a UI.
     */
    setUIUpdater(updater) {
        this.uiUpdater = updater;
    }

    /**
     * Chama o atualizador da UI, se definido.
     * @protected
     */
    _atualizarUI() {
        if (this.uiUpdater) {
            this.uiUpdater(this);
        } else {
            // console.warn(`UI Updater não definido para ${this.modelo}`);
        }
    }

    /**
     * Exibe uma mensagem de status na interface.
     * Implementação placeholder, idealmente viria de um módulo utils.
     * @param {string} mensagem - A mensagem a ser exibida.
     * @param {'success'|'error'|'info'|'warn'} tipo - O tipo de mensagem.
     * @protected
     */
    _exibirStatus(mensagem, tipo = 'info') {
        // console.log(`[${tipo.toUpperCase()}] ${this.modelo}: ${mensagem}`);
        // No Garagem.js, haverá uma função global para isso, ou usar utils.js
        const statusMessagesEl = document.getElementById('status-messages');
        if (statusMessagesEl) {
            statusMessagesEl.textContent = mensagem;
            statusMessagesEl.className = ''; // Limpa classes antigas
            statusMessagesEl.classList.add(`status-${tipo}`); // Adiciona a classe baseada no tipo
            statusMessagesEl.style.display = 'block';
            statusMessagesEl.style.opacity = '1';

            if (statusMessagesEl.timeoutId) clearTimeout(statusMessagesEl.timeoutId);

            statusMessagesEl.timeoutId = setTimeout(() => {
                statusMessagesEl.style.opacity = '0';
                setTimeout(() => statusMessagesEl.style.display = 'none', 500);
            }, 3000);
        }
    }

    /**
     * Liga o veículo.
     * @returns {void}
     */
    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            this.velocidade = 0; // Resetar velocidade ao ligar
            this._exibirStatus(`${this.constructor.name} ${this.modelo} ligado.`, 'success');
        } else {
            this._exibirStatus(`${this.constructor.name} ${this.modelo} já está ligado.`, 'info');
        }
        this._atualizarUI();
    }

    /**
     * Desliga o veículo.
     * @returns {void}
     */
    desligar() {
        if (this.ligado) {
            if (this.velocidade > 0) {
                this._exibirStatus(`Primeiro pare o ${this.constructor.name} ${this.modelo} para desligar.`, 'error');
                return;
            }
            this.ligado = false;
            this.velocidade = 0;
            this._exibirStatus(`${this.constructor.name} ${this.modelo} desligado.`, 'success');
        } else {
            this._exibirStatus(`${this.constructor.name} ${this.modelo} já está desligado.`, 'info');
        }
        this._atualizarUI();
    }

    /**
     * Acelera o veículo.
     * @param {number} [valor=10] - O valor a ser adicionado à velocidade. Padrão é 10.
     * @returns {void}
     */
    acelerar(valor = 10) {
        if (!this.ligado) {
            this._exibirStatus(`Ligue o ${this.constructor.name} ${this.modelo} para acelerar.`, 'warn');
            return;
        }
        if (this.velocidade < this.velocidadeMaxima) {
            this.velocidade += valor;
            if (this.velocidade > this.velocidadeMaxima) {
                this.velocidade = this.velocidadeMaxima;
            }
            this._exibirStatus(`Acelerando! Velocidade: ${this.velocidade} km/h`, 'info');
        } else {
            this._exibirStatus("Velocidade máxima atingida!", 'info');
        }
        this._atualizarUI();
    }

    /**
     * Freia o veículo.
     * @param {number} [valor=10] - O valor a ser subtraído da velocidade. Padrão é 10.
     * @returns {void}
     */
    frear(valor = 10) {
        if (this.velocidade > 0) {
            this.velocidade -= valor;
            if (this.velocidade < 0) {
                this.velocidade = 0;
            }
            this._exibirStatus(`Freando. Velocidade: ${this.velocidade} km/h`, 'info');
        } else {
            this._exibirStatus(`${this.constructor.name} ${this.modelo} está parado.`, 'info');
        }
        this._atualizarUI();
    }

    /**
     * Aciona a buzina do veículo.
     * @returns {void}
     */
    buzinar() {
        this._exibirStatus(`${this.constructor.name} ${this.modelo} buzinou: Beep! Beep!`, 'info');
        // Efeito sonoro poderia ser adicionado aqui
    }

    /**
     * Adiciona um registro de manutenção ao histórico do veículo.
     * @param {Manutencao} servico - O objeto Manutencao a ser adicionado.
     * @returns {void}
     */
    adicionarManutencao(servico) {
        if (!(servico instanceof Manutencao)) {
            this._exibirStatus("Serviço inválido.", 'error');
            console.error("Tentativa de adicionar serviço inválido:", servico);
            return;
        }
        this.historicoManutencao.push(servico);
        // Ordena o histórico por data (mais recentes primeiro, ou mais antigos - decida o critério)
        this.historicoManutencao.sort((a, b) => {
            const dateA = a.getDateTimeObject();
            const dateB = b.getDateTimeObject();
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; // Coloca nulos no final
            if (!dateB) return -1; // Coloca nulos no final
            return dateB - dateA; // Mais recentes primeiro
        });
        this._exibirStatus(`Serviço "${servico.descricao}" adicionado para ${this.modelo}.`, 'success');
        this._atualizarUI(); // Para atualizar a lista de histórico na UI
        this.salvarNoLocalStorage(); // Salva após adicionar manutenção
    }

    /**
     * Salva o estado atual do veículo (incluindo manutenções) no LocalStorage.
     * @returns {void}
     */
    salvarNoLocalStorage() {
        try {
            // Prepara o objeto para serialização, convertendo Manutencao para plain objects
            const plainManutencoes = this.historicoManutencao.map(m => ({
                id: m.id,
                descricao: m.descricao,
                data: m.data,
                hora: m.hora,
                custo: m.custo,
                tipo: m.tipo,
                concluida: m.concluida
            }));

            const veiculoData = {
                modelo: this.modelo,
                cor: this.cor,
                tipoVeiculo: this._tipoVeiculo, // Salva o tipo original para recriação
                velocidadeMaxima: this.velocidadeMaxima,
                ligado: this.ligado,
                velocidade: this.velocidade,
                historicoManutencao: plainManutencoes,
                // Adicionar outras propriedades específicas se necessário (ex: turboLigado, cargaAtual)
            };

            // Adiciona propriedades específicas de subclasses
            if (this.constructor.name === "CarroEsportivo") {
                veiculoData.turboLigado = this.turboLigado;
            }
            if (this.constructor.name === "Caminhao") {
                veiculoData.cargaAtual = this.cargaAtual;
                veiculoData.capacidadeMaximaCarga = this.capacidadeMaximaCarga;
            }
            if (this.constructor.name === "Bicicleta") {
                veiculoData.status = this.status;
            }

            localStorage.setItem(`veiculo_${this._tipoVeiculo}`, JSON.stringify(veiculoData));
        } catch (e) {
            console.error("Erro ao salvar veículo no LocalStorage:", e);
            this._exibirStatus("Erro ao salvar dados do veículo.", "error");
        }
    }

    /**
     * Carrega o estado do veículo do LocalStorage.
     * @param {string} tipoVeiculo - O tipo do veículo (ex: 'carro')
     * @returns {object|null} Os dados carregados ou null.
     * @static
     */
    static carregarDoLocalStorage(tipoVeiculo) {
        const dataJSON = localStorage.getItem(`veiculo_${tipoVeiculo}`);
        if (dataJSON) {
            try {
                const data = JSON.parse(dataJSON);
                // A recriação das instâncias de Manutencao será feita pela Garagem
                // ao receber esses dados.
                return data;
            } catch (e) {
                console.error(`Erro ao carregar ${tipoVeiculo} do LocalStorage:`, e);
                localStorage.removeItem(`veiculo_${tipoVeiculo}`); // Remove dados corruptos
                return null;
            }
        }
        return null;
    }

    /**
     * Simula a interação com detalhes extras (API).
     * @returns {Promise<object>} Uma promessa que resolve com os detalhes do veículo.
     */
    async obterDetalhesExtras() {
        this._exibirStatus(`Buscando detalhes extras para ${this.modelo}...`, 'info');
        // Simulação de chamada de API
        return new Promise(resolve => {
            setTimeout(() => {
                const detalhes = {
                    fabricante: "Fabricante Genérico",
                    ano: new Date().getFullYear() - Math.floor(Math.random() * 5),
                    consumoMedio: `${(Math.random() * 10 + 5).toFixed(1)} km/l`,
                    ultimaRevisaoAPI: Manutencao.formatarDataBR(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)),
                };
                resolve(detalhes);
            }, 1500);
        });
    }
}