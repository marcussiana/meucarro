// --- CLASSES DO MODELO ---

class Manutencao {
    constructor(data, tipo, custo, descricao = '') {
        if (!data || !tipo || isNaN(parseFloat(custo)) || parseFloat(custo) < 0) {
            throw new Error("Dados de manutenção inválidos. Verifique todos os campos.");
        }
        this.data = data;
        this.tipo = tipo;
        this.custo = parseFloat(custo);
        this.descricao = descricao;
    }

    formatar() {
        const dataObj = new Date(this.data + 'T00:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        return `${this.tipo} (${dataFormatada}) - R$ ${this.custo.toFixed(2)}`;
    }
}

class Veiculo {
    constructor(id, modelo, cor, tipoVeiculo) {
        this.id = id || `v_${Date.now()}`;
        this.modelo = modelo;
        this.cor = cor;
        this.tipoVeiculo = tipoVeiculo;
        this.ligado = false;
        this.historicoManutencao = [];
    }

    ligar() { this.ligado = true; }
    desligar() { this.ligado = false; }

    adicionarManutencao(manutencao) {
        if (manutencao instanceof Manutencao) {
            this.historicoManutencao.push(manutencao);
            this.historicoManutencao.sort((a, b) => new Date(b.data) - new Date(a.data));
        }
    }
}

class Carro extends Veiculo { constructor(id, modelo, cor) { super(id, modelo, cor, 'Carro'); } }
class CarroEsportivo extends Veiculo { constructor(id, modelo, cor) { super(id, modelo, cor, 'CarroEsportivo'); } }
class Caminhao extends Veiculo { constructor(id, modelo, cor) { super(id, modelo, cor, 'Caminhao'); } }

class Garagem {
    constructor() {
        this.veiculos = [];
        this.veiculoSelecionado = null;
    }

    adicionarVeiculo(veiculo) {
        this.veiculos.push(veiculo);
        this.salvar();
    }
    
    excluirVeiculo(id) {
        this.veiculos = this.veiculos.filter(v => v.id !== id);
        if (this.veiculoSelecionado && this.veiculoSelecionado.id === id) {
            this.veiculoSelecionado = null;
        }
        this.salvar();
    }

    selecionarVeiculo(id) {
        this.veiculoSelecionado = this.veiculos.find(v => v.id === id) || null;
    }

    salvar() {
        localStorage.setItem('garagem_inteligente_final', JSON.stringify(this.veiculos));
    }

    carregar() {
        const dadosJSON = localStorage.getItem('garagem_inteligente_final');
        if (!dadosJSON) return;

        try {
            const dados = JSON.parse(dadosJSON);
            this.veiculos = dados.map(d => {
                let veiculo;
                const construtores = { Carro, CarroEsportivo, Caminhao };
                const Construtor = construtores[d.tipoVeiculo] || Veiculo;
                veiculo = new Construtor(d.id, d.modelo, d.cor);
                veiculo.ligado = d.ligado || false;

                if (d.historicoManutencao) {
                    veiculo.historicoManutencao = d.historicoManutencao.map(m => new Manutencao(m.data, m.tipo, m.custo, m.descricao));
                }
                return veiculo;
            });
        } catch (e) {
            console.error("Erro ao carregar dados do LocalStorage:", e);
            localStorage.removeItem('garagem_inteligente_final');
        }
    }
}


// --- CONTROLE DA INTERFACE (UI) ---

const garagem = new Garagem();
const uiManager = {
    // Seletores do DOM
    listaVeiculosNav: document.getElementById('lista-veiculos'),
    bemVindoPanel: document.getElementById('painel-boas-vindas'),
    detalhesPanel: document.getElementById('painel-detalhes-conteudo'),
    nomeVeiculoEl: document.getElementById('nome-veiculo-selecionado'),
    statusVeiculoEl: document.getElementById('status-veiculo-selecionado'),
    listaAgendamentosEl: document.getElementById('lista-agendamentos'),
    listaHistoricoEl: document.getElementById('lista-historico'),
    
    // Botões
    btnLigar: document.getElementById('btn-ligar-veiculo'),
    btnDesligar: document.getElementById('btn-desligar-veiculo'),
    btnExcluir: document.getElementById('btn-excluir-veiculo'),
    btnAbrirModal: document.getElementById('btn-abrir-modal-veiculo'),
    btnCancelarModal: document.getElementById('btn-cancelar-modal'),
    
    // Forms e Modal
    formAgendamento: document.getElementById('form-agendamento'),
    modal: document.getElementById('modal-veiculo'),
    formAddVeiculo: document.getElementById('form-add-veiculo'),

    init() {
        garagem.carregar();
        this.setupEventListeners();
        this.render();
    },

    render() {
        this.renderListaVeiculos();
        this.renderPainelPrincipal();
    },
    
    renderListaVeiculos() {
        this.listaVeiculosNav.innerHTML = '';
        if (garagem.veiculos.length === 0) {
            this.listaVeiculosNav.innerHTML = `<p style="padding: 1rem; color: #6b7280;">Nenhum veículo na garagem.</p>`;
            return;
        }
        garagem.veiculos.forEach(v => {
            const link = document.createElement('a');
            link.textContent = `${v.modelo} (${v.cor})`;
            link.dataset.id = v.id;
            if (garagem.veiculoSelecionado && garagem.veiculoSelecionado.id === v.id) {
                link.classList.add('selecionado');
            }
            link.onclick = () => {
                garagem.selecionarVeiculo(v.id);
                this.render();
            };
            this.listaVeiculosNav.appendChild(link);
        });
    },
    
    renderPainelPrincipal() {
        const veiculo = garagem.veiculoSelecionado;
        if (!veiculo) {
            this.bemVindoPanel.classList.remove('hidden');
            this.detalhesPanel.classList.add('hidden');
            return;
        }
        
        this.bemVindoPanel.classList.add('hidden');
        this.detalhesPanel.classList.remove('hidden');
        
        // Header
        this.nomeVeiculoEl.textContent = `${veiculo.modelo} - ${veiculo.cor}`;
        this.statusVeiculoEl.textContent = veiculo.ligado ? 'Ligado' : 'Desligado';
        this.statusVeiculoEl.className = `status ${veiculo.ligado ? 'ligado' : 'desligado'}`;
        this.btnLigar.disabled = veiculo.ligado;
        this.btnDesligar.disabled = !veiculo.ligado;
        
        // Listas de Manutenção
        const hoje = new Date().toISOString().split('T')[0];
        const agendamentos = veiculo.historicoManutencao.filter(m => m.data >= hoje);
        const historico = veiculo.historicoManutencao.filter(m => m.data < hoje);

        this.renderListaManutencao(this.listaAgendamentosEl, agendamentos);
        this.renderListaManutencao(this.listaHistoricoEl, historico);
    },

    renderListaManutencao(element, lista) {
        element.innerHTML = '';
        if (lista.length === 0) {
            const li = document.createElement('li');
            element.appendChild(li); // Cria a li vazia para o CSS :empty funcionar
            return;
        }
        lista.forEach(m => {
            const li = document.createElement('li');
            li.textContent = m.formatar();
            element.appendChild(li);
        });
    },

    setupEventListeners() {
        // Ações do veículo
        this.btnLigar.onclick = () => { garagem.veiculoSelecionado?.ligar(); garagem.salvar(); this.render(); };
        this.btnDesligar.onclick = () => { garagem.veiculoSelecionado?.desligar(); garagem.salvar(); this.render(); };
        this.btnExcluir.onclick = () => {
            if (confirm(`Tem certeza que deseja excluir o ${garagem.veiculoSelecionado.modelo}? Esta ação não pode ser desfeita.`)) {
                garagem.excluirVeiculo(garagem.veiculoSelecionado.id);
                this.render();
            }
        };

        // Modal
        this.btnAbrirModal.onclick = () => this.modal.classList.remove('hidden');
        this.btnCancelarModal.onclick = () => this.modal.classList.add('hidden');
        
        // Forms
        this.formAddVeiculo.onsubmit = (e) => {
            e.preventDefault();
            const tipo = e.target.elements['tipo-veiculo'].value;
            const modelo = e.target.elements['modelo-veiculo'].value;
            const cor = e.target.elements['cor-veiculo'].value;

            const construtores = { Carro, CarroEsportivo, Caminhao };
            const novoVeiculo = new construtores[tipo](null, modelo, cor);
            
            garagem.adicionarVeiculo(novoVeiculo);
            garagem.selecionarVeiculo(novoVeiculo.id);
            this.modal.classList.add('hidden');
            e.target.reset();
            this.render();
        };

        this.formAgendamento.onsubmit = (e) => {
            e.preventDefault();
            const data = e.target.elements['data'].value;
            const tipo = e.target.elements['tipo-servico'].value;
            const custo = e.target.elements['custo'].value;
            const descricao = e.target.elements['descricao'].value;
            
            try {
                const manutencao = new Manutencao(data, tipo, custo, descricao);
                garagem.veiculoSelecionado.adicionarManutencao(manutencao);
                garagem.salvar();
                alert('Serviço agendado com sucesso!');
                e.target.reset();
                this.render();
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        };
    }
};

document.addEventListener('DOMContentLoaded', () => uiManager.init());