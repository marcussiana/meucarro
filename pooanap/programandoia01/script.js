document.addEventListener('DOMContentLoaded', function() {

    // --- Constantes e Variáveis Globais ---
    const CHAVE_STORAGE = 'garagemInteligenteDados_v1'; // Chave única para LocalStorage
    const statusMessagesEl = document.getElementById('status-messages');
    const agendamentosFuturosListaEl = document.getElementById('agendamentos-futuros-lista');

    // Mapa para guardar as instâncias dos veículos
    let veiculos = {};

    // --- Funções Auxiliares ---

    /**
     * Exibe mensagens para o usuário na área de status.
     * @param {string} mensagem O texto da mensagem.
     * @param {'info' | 'success' | 'error'} tipo O tipo da mensagem (para estilização CSS).
     * @param {number} [tempo=4000] Tempo em milissegundos para a mensagem desaparecer (0 para não desaparecer).
     */
    function mostrarMensagem(mensagem, tipo = 'info', tempo = 4000) {
        if (!statusMessagesEl) {
             console.warn("Elemento #status-messages não encontrado para exibir mensagem:", mensagem);
             // Fallback para alert se o elemento sumir
             alert(`[${tipo.toUpperCase()}] ${mensagem}`);
             return;
        }
        statusMessagesEl.textContent = mensagem;
        statusMessagesEl.className = ''; // Limpa classes antigas
        // Força reflow para garantir que a transição funcione
        void statusMessagesEl.offsetWidth;
        statusMessagesEl.classList.add(`status-${tipo}`); // Adiciona classe do tipo
        statusMessagesEl.style.display = 'block'; // Torna visível
        // Inicia a transição de opacidade um frame depois de definir display: block
        requestAnimationFrame(() => {
             statusMessagesEl.style.opacity = 1;
        });

        // Limpa timers anteriores para evitar comportamento inesperado
        if (statusMessagesEl.timer) clearTimeout(statusMessagesEl.timer);
        if (statusMessagesEl.fadeTimer) clearTimeout(statusMessagesEl.fadeTimer);

        if (tempo > 0) {
            statusMessagesEl.timer = setTimeout(() => {
                statusMessagesEl.style.opacity = 0; // Inicia fade out (CSS transition faz o resto)
                // Agenda para esconder o elemento *depois* da transição CSS (0.5s)
                 statusMessagesEl.fadeTimer = setTimeout(() => {
                     // Verifica se a opacidade ainda é 0 (pode ter sido reativado)
                     if (statusMessagesEl.style.opacity === '0') {
                         statusMessagesEl.style.display = 'none';
                         statusMessagesEl.textContent = '';
                         statusMessagesEl.className = ''; // Limpa classes ao esconder
                     }
                 }, 500); // Tempo da transição de opacidade definida no CSS
            }, tempo);
        }
    }


    /**
     * Converte string DD/MM/AAAA e HH:MM para um objeto Date.
     * Retorna null se a data for inválida.
     * @param {string} dataStr String da data (DD/MM/AAAA)
     * @param {string} [horaStr] String da hora (HH:MM) - opcional
     * @returns {Date | null}
     */
    function parseDataHora(dataStr, horaStr) {
        if (!dataStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
            // console.warn("Formato de data inválido:", dataStr);
             return null;
        }
        const partesData = dataStr.split('/');
        const dia = parseInt(partesData[0], 10);
        const mes = parseInt(partesData[1], 10) - 1; // Meses são 0-11
        const ano = parseInt(partesData[2], 10);

        // Validação básica do ano
        if (ano < 1900 || ano > 2100) {
             console.warn("Ano inválido:", ano);
             return null;
        }

        let horas = 0;
        let minutos = 0;
        if (horaStr && /^\d{1,2}:\d{2}$/.test(horaStr)) { // Permite H:MM ou HH:MM
            const partesHora = horaStr.split(':');
            horas = parseInt(partesHora[0], 10);
            minutos = parseInt(partesHora[1], 10);
            // Validação dos limites de hora/minuto
            if(horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
                 console.warn("Hora ou minuto inválido:", horaStr);
                 return null;
            }
        } else if (horaStr && horaStr.trim() !== '') { // Algo foi digitado mas não é formato válido
             console.warn("Formato de hora inválido:", horaStr);
             return null;
        }

        // Cria o objeto Date
        const dataObj = new Date(ano, mes, dia, horas, minutos, 0, 0); // Zera segundos e ms

        // Validação crucial: Verifica se o objeto Date criado corresponde exatamente aos valores fornecidos
        // Isso pega datas inválidas como 31/02/2024, que o Date() pode auto-corrigir para 02/03/2024
        if (dataObj.getFullYear() === ano &&
            dataObj.getMonth() === mes &&
            dataObj.getDate() === dia &&
            dataObj.getHours() === horas &&
            dataObj.getMinutes() === minutos) {
            return dataObj; // Data e hora são válidas
        } else {
             console.warn("Data/Hora inválida ou inexistente no calendário:", dataStr, horaStr);
            return null; // Data inválida (ex: dia 31 em mês de 30 dias)
        }
    }


    // --- Classe Manutencao (Representa UM registro) ---
    class Manutencao {
        constructor(data, tipo, custo, descricao, hora = null) {
            this.data = data; // String DD/MM/AAAA
            this.tipo = tipo || "Não especificado";
            const custoNum = parseFloat(custo);
            this.custo = !isNaN(custoNum) && isFinite(custoNum) ? custoNum : 0.0;
            this.descricao = descricao || "Serviço não descrito"; // Permite descrição vazia

             // Normaliza hora para HH:MM ou null, lidando com formatos como H:MM
             if (hora && /^\d{1,2}:\d{2}$/.test(hora)) {
                  const partes = hora.split(':');
                  this.hora = partes[0].padStart(2, '0') + ':' + partes[1]; // Garante HH:MM
             } else {
                  this.hora = null; // Define como null se inválido ou vazio
             }

            // Tenta criar o objeto Date interno para validação e comparação
            this._dataObj = parseDataHora(this.data, this.hora);
        }

        /** Retorna uma representação formatada da manutenção. */
        toString(incluirCusto = true) {
             // Se a data for inválida, indica isso
             if (!this._dataObj) {
                  return `[Data Inválida: ${this.data}] ${this.tipo} - ${this.descricao}`;
             }

            let str = `${this.tipo} em ${this.data}`;
            if (this.hora) {
                str += ` às ${this.hora}`;
            }
            // Adiciona descrição apenas se houver alguma
            str += this.descricao ? `: ${this.descricao}` : '';
            if (incluirCusto && this.custo > 0) {
                str += ` (Custo: R$ ${this.custo.toFixed(2)})`;
            }
            return str;
        }

        /** Gera o HTML de um item da lista de histórico. */
        toListItemHTML() {
            const li = document.createElement('li');
            li.textContent = this.toString();
            if (this.tipo.toLowerCase() === 'agendada') {
                li.classList.add('agendada');
                // Adiciona data/hora ISO como atributo para possível ordenação avançada ou tooltip
                 if (this._dataObj) {
                    li.dataset.datetime = this._dataObj.toISOString();
                    // Adiciona um title para ver data/hora completa no hover
                    li.title = `Agendado para: ${this._dataObj.toLocaleString('pt-BR')}`;
                 } else {
                     li.title = "Agendamento com data/hora inválida.";
                 }
            }
             // Adiciona tooltip com custo se houver
             if (this.custo > 0) {
                  li.title = (li.title ? li.title + ' - ' : '') + `Custo: R$ ${this.custo.toFixed(2)}`;
             }
            return li;
        }

        /** Valida os dados básicos da manutenção. Retorna true se válido. */
        validar() {
             // Tipo é obrigatório
             if (!this.tipo || this.tipo.trim() === '') {
                 mostrarMensagem("Erro: Tipo de serviço é obrigatório.", 'error');
                 return false;
             }
            // A data/hora deve ser válida (verificada pelo _dataObj)
             if (!this._dataObj) {
                 mostrarMensagem("Erro: Data ou Hora inválida/inexistente. Use DD/MM/AAAA e HH:MM (opcional).", 'error');
                 return false;
             }
             // Custo não pode ser negativo
            if (this.custo < 0) {
                mostrarMensagem("Erro: O custo não pode ser negativo.", 'error');
                return false;
            }
             // Descrição é opcional, não precisa validar aqui.
            return true; // Se passou por tudo, é válido
        }

        /** Verifica se esta manutenção está agendada para o futuro. */
        isAgendamentoFuturo() {
            if (this.tipo.toLowerCase() !== 'agendada' || !this._dataObj) {
                return false;
            }
            const agora = new Date();
            // Considera futuro se for estritamente depois do momento atual
            return this._dataObj.getTime() > agora.getTime();
        }
    }

    // --- Classe GerenciadorManutencao (Gerencia a lista de UM veículo) ---
    class GerenciadorManutencao {
        constructor(veiculoTipo) {
            this.historicoServicos = []; // Array de objetos Manutencao
            this.veiculoTipo = veiculoTipo;
            this.listaHistoricoElement = document.getElementById(`${veiculoTipo}-historico-lista`);
             if (!this.listaHistoricoElement) {
                 console.error(`CRÍTICO: Elemento da lista de histórico #${veiculoTipo}-historico-lista não encontrado no HTML.`);
             }
        }

        /** Adiciona um objeto Manutencao ao histórico. Retorna true se sucesso. */
        adicionarServico(servico) {
            if (!(servico instanceof Manutencao)) {
                 mostrarMensagem("Erro interno: Objeto de serviço inválido.", 'error');
                return false;
            }
            // A validação do 'servico' já deve ter sido feita ANTES de chamar este método

            this.historicoServicos.push(servico);
            this.ordenarHistorico(); // Mantém ordenado
            this.atualizarDisplayHistorico();
            atualizarDisplayAgendamentosFuturos(); // Atualiza a lista geral
            salvarGaragem(); // Salva no LocalStorage
            return true; // Sucesso
        }

        /** Ordena o histórico por data/hora */
        ordenarHistorico() {
            this.historicoServicos.sort((a, b) => {
                // Usa o objeto Date interno (_dataObj) para comparação precisa
                // Se _dataObj for null (data inválida), trata como data mínima para ir pro início
                const dateA = a._dataObj || new Date(-8640000000000000); // Data mínima
                const dateB = b._dataObj || new Date(-8640000000000000);
                if (dateA.getTime() === dateB.getTime()) return 0;
                return dateA - dateB; // Ordena do mais antigo para o mais recente
            });
        }


        /** Retorna a lista completa de todos os serviços (cópia). */
        getHistoricoCompleto() {
            return [...this.historicoServicos];
        }

        /** Retorna apenas os serviços que são agendamentos futuros. */
        getAgendamentosFuturos() {
            return this.historicoServicos.filter(servico => servico.isAgendamentoFuturo());
        }

        /** Atualiza a lista <ul> no HTML com o histórico. */
        atualizarDisplayHistorico() {
             if (!this.listaHistoricoElement) return; // Se não encontrou, não faz nada

            this.listaHistoricoElement.innerHTML = ''; // Limpa a lista

            if (this.historicoServicos.length === 0) {
                this.listaHistoricoElement.innerHTML = '<li>Nenhum serviço registrado.</li>';
            } else {
                // Adiciona cada serviço como um item de lista
                this.historicoServicos.forEach(servico => {
                    this.listaHistoricoElement.appendChild(servico.toListItemHTML());
                });
            }
        }

        /** Carrega o histórico a partir de dados simples (ex: do LocalStorage). */
        carregarHistorico(historicoSalvo) {
            if (!Array.isArray(historicoSalvo)) return;

            this.historicoServicos = historicoSalvo
                // Filtra dados potencialmente corrompidos ou incompletos
                .filter(servicoData => servicoData && servicoData.data && servicoData.tipo)
                .map(servicoData => {
                     // Recria a instância da classe Manutencao
                    const manut = new Manutencao(
                        servicoData.data,
                        servicoData.tipo,
                        servicoData.custo,
                        servicoData.descricao,
                        servicoData.hora
                    );
                     // Se a data for inválida após recriar, loga um aviso mas mantém o registro
                     if (!manut._dataObj) {
                          console.warn(`Registro de manutenção carregado com data/hora inválida para ${this.veiculoTipo}:`, servicoData);
                     }
                     return manut;
                }
            );
            this.ordenarHistorico(); // Ordena após carregar
            this.atualizarDisplayHistorico(); // Atualiza a exibição
        }
    }


    // --- Classe Veiculo (Base) ---
    class Veiculo {
        constructor(modelo, cor, tipo) {
            if(!tipo) throw new Error("Tipo do veículo é obrigatório no construtor.");
            this.modelo = modelo || `Modelo ${tipo}`;
            this.cor = cor || "Não definida";
            this.tipo = tipo; // 'carro', 'esportivo', 'caminhao', 'moto', 'bicicleta'
            this.ligado = false;
            this.velocidade = 0;
            this.manutencao = new GerenciadorManutencao(this.tipo); // Composição!
            this.outrasProps = {}; // Para propriedades específicas (turbo, carga)
        }

        // --- Métodos de Ação ---
        ligar() {
            if (this.ligado) {
                 mostrarMensagem(`${this.modelo} já está ligado.`, 'info', 2000);
                 return;
            }
            this.ligado = true;
            this.atualizarStatusDisplay();
            salvarGaragem();
            mostrarMensagem(`${this.modelo} ligado.`, 'success', 2000);
        }

        desligar() {
             if (!this.ligado && !(this instanceof Bicicleta)) {
                  mostrarMensagem(`${this.modelo} já está desligado.`, 'info', 2000);
                  return;
             }
             // Bicicleta não desliga, mas outras podem ter restrição de velocidade
            if (this.velocidade > 0 && !(this instanceof Bicicleta) ) {
                 mostrarMensagem(`Freie o ${this.tipo} ${this.modelo} antes de desligar! Velocidade: ${this.velocidade} km/h`, 'error');
                return;
            }
            // Se for bicicleta, não faz nada aqui (método é sobrescrito)
             if(this instanceof Bicicleta) {
                  console.log("Bicicleta não pode ser desligada.");
                  return;
             }

            this.ligado = false;
            this.velocidade = 0; // Zera velocidade ao desligar
            this.atualizarStatusDisplay();
            this.atualizarVelocidadeDisplay(); // Atualiza display da velocidade zerada
            // Classes filhas podem precisar desligar turbo aqui (feito nelas)
            salvarGaragem();
            mostrarMensagem(`${this.modelo} desligado.`, 'success', 2000);
        }

        acelerar(){
            // Bicicleta não precisa estar "ligada"
            if (!this.ligado && !(this instanceof Bicicleta)) {
                 mostrarMensagem(`${this.modelo} precisa estar ligado para acelerar.`, 'error');
                 return false; // Não pode acelerar
            }
             // A lógica de quanto acelerar fica nas classes filhas
             return true; // Pode acelerar
        }
        frear(){
             if (this.velocidade <= 0) return; // Sem ação se já parado
              // A lógica de quanto frear fica nas classes filhas
             // A atualização do display é feita nas filhas após calcular nova velocidade
        }
        buzinar(){ mostrarMensagem(`Buzina padrão do ${this.tipo}!`, 'info', 2000); }

         // --- Métodos de Atualização do Display (DOM) ---
        // Atualiza o status (Ligado/Desligado ou Parada/Em Movimento para bike)
        atualizarStatusDisplay() {
           const statusEl = document.getElementById(`${this.tipo}-status`);
           if(statusEl) {
                 if(this instanceof Bicicleta){ // Lógica específica da bike
                      statusEl.textContent = this.velocidade > 0 ? "Em movimento" : "Parada";
                 } else { // Lógica para outros veículos
                      statusEl.textContent = this.ligado ? "Ligado" : "Desligado";
                 }
           } else { console.warn(`Elemento de status #${this.tipo}-status não encontrado.`); }
        }

        // Atualiza a velocidade exibida
        atualizarVelocidadeDisplay() {
           const velEl = document.getElementById(`${this.tipo}-velocidade`);
           if(velEl) {
                velEl.textContent = Math.round(this.velocidade); // Arredonda para exibição
                // Salva no LS quando a velocidade muda (exceto para bike a cada pedalada)
                // Salvar a cada mudança pode ser pesado, alternativas: salvar periodicamente ou só ao desligar/mudar de veículo.
                // Vamos manter salvando, mas ciente da performance.
                 if(!(this instanceof Bicicleta)) {
                    salvarGaragem();
                 }
           } else { console.warn(`Elemento de velocidade #${this.tipo}-velocidade não encontrado.`); }
        }

        // --- Métodos de Manutenção ---
        // Adiciona um serviço validado ao gerenciador
        adicionarServicoManutencao(servico) {
           return this.manutencao.adicionarServico(servico);
        }

        /** Inicializa/Atualiza todos os displays básicos do veículo no HTML */
        inicializarDisplayBase() {
             const ids = ['modelo', 'cor']; // Propriedades diretas
             ids.forEach(id => {
                 const el = document.getElementById(`${this.tipo}-${id}`);
                 if (el) el.textContent = this[id];
                 else console.warn(`Elemento #${this.tipo}-${id} não encontrado.`);
             });
             // Chama os métodos de atualização específicos
             this.atualizarStatusDisplay();
             this.atualizarVelocidadeDisplay();
             // Atualiza também o histórico de manutenção associado
             if (this.manutencao) {
                  this.manutencao.atualizarDisplayHistorico();
             }
        }

        /** Prepara o objeto para ser salvo no LocalStorage (sem métodos) */
        toJSON() {
            // Cria um objeto base com propriedades comuns
             const data = {
                modelo: this.modelo,
                cor: this.cor,
                tipo: this.tipo,
                // Estado atual
                ligado: this.ligado,
                velocidade: this.velocidade,
                // Histórico de manutenção (array de dados simples)
                historicoManutencao: this.manutencao.getHistoricoCompleto().map(servico => ({
                    data: servico.data,
                    tipo: servico.tipo,
                    custo: servico.custo,
                    descricao: servico.descricao,
                    hora: servico.hora
                })),
                // Propriedades específicas salvas pelas classes filhas
                outrasProps: { ...this.outrasProps } // Copia para evitar referência
            };
             // Bicicleta não precisa salvar 'ligado'
             if (this instanceof Bicicleta) {
                  delete data.ligado;
             }
             return data;
        }
    }

    // --- Classes Filhas (Herança e Especialização) ---

    class Carro extends Veiculo {
        constructor(modelo, cor, tipo = 'carro', outrasProps = {}) {
             super(modelo, cor, tipo);
             Object.assign(this.outrasProps, outrasProps); // Mescla props salvas
             this.inicializarDisplay(); // Chama o inicializador específico
        }
        acelerar() {
             if(!super.acelerar()) return; // Verifica se pode acelerar (ligado?)
             this.velocidade += 10;
             this.atualizarVelocidadeDisplay(); // Atualiza e salva
        }
        frear() {
            const velAntes = this.velocidade;
            super.frear(); // Chama verificação base (velocidade > 0)
            if (velAntes > 0) {
                 this.velocidade -= 10;
                 this.velocidade = Math.max(0, this.velocidade); // Garante não ficar negativo
                 this.atualizarVelocidadeDisplay(); // Atualiza e salva
            }
        }
        buzinar() { mostrarMensagem("Beep! Beep! (Carro Casual)", 'info', 1500); } // Tempo menor
        // Usa o inicializador da classe base Veiculo
        inicializarDisplay(){ this.inicializarDisplayBase(); }
    }

    class CarroEsportivo extends Carro {
        constructor(modelo, cor, outrasProps = {}) {
            // Garante que 'turboAtivado' exista em outrasProps ao carregar, com padrão false
            super(modelo, cor, 'esportivo', { turboAtivado: false, ...outrasProps });
            this.inicializarDisplayEsportivo();
        }

        get turboAtivado() { return this.outrasProps.turboAtivado === true; } // Garante booleano
        set turboAtivado(valor) {
             const novoValor = valor === true; // Garante booleano
            if (this.outrasProps.turboAtivado !== novoValor){
                 this.outrasProps.turboAtivado = novoValor;
                 salvarGaragem(); // Salva quando o estado do turbo muda
            }
        }

        ativarTurbo() {
            if (!this.ligado) { mostrarMensagem("Ligue o carro esportivo primeiro!", 'error'); return; }
            if (this.turboAtivado) { mostrarMensagem("Turbo já está ativo.", 'info', 1500); return; }

            this.turboAtivado = true; // Setter salva
            this.velocidade += 30; // Boost inicial
            this.atualizarTurboDisplay();
            this.atualizarVelocidadeDisplay();
            mostrarMensagem("Turbo Ativado!", 'success', 2000);
        }

        desativarTurbo() {
            if (!this.turboAtivado) { mostrarMensagem("Turbo já está desativado.", 'info', 1500); return; }
            this.turboAtivado = false; // Setter salva
            this.atualizarTurboDisplay();
            mostrarMensagem("Turbo Desativado.", 'info', 2000);
        }

        acelerar() {
            if(!super.acelerar()) return; // Chama Carro.acelerar (verifica ligado)
             let incremento = 12; // Base do esportivo
             if (this.turboAtivado) { incremento += 18; } // Bônus turbo
             this.velocidade += incremento;
             this.atualizarVelocidadeDisplay();
        }

        frear() {
            const velAntes = this.velocidade;
            super.frear(); // Chama Carro.frear (verifica > 0)
            if (velAntes > 0) {
                 this.velocidade -= 15; // Freio mais forte
                 this.velocidade = Math.max(0, this.velocidade);
                 this.atualizarVelocidadeDisplay();
            }
        }

        buzinar() { mostrarMensagem("Vrum! Vrum! (Esportivo)", 'info', 1500); }

        atualizarTurboDisplay() {
           const turboEl = document.getElementById(`${this.tipo}-turbo`);
           if(turboEl) turboEl.textContent = this.turboAtivado ? "Ativado" : "Desativado";
           else console.warn(`Elemento #${this.tipo}-turbo não encontrado.`);
            // Salvar é feito pelo setter agora
        }

        inicializarDisplayEsportivo(){
            this.inicializarDisplayBase(); // Chama o inicializador base do Veiculo
            this.atualizarTurboDisplay(); // Atualiza o display específico do turbo
        }

        desligar() {
             super.desligar(); // Chama o desligar do Carro
             // Se realmente desligou (não foi impedido pela velocidade)
             if (!this.ligado) {
                 this.turboAtivado = false; // Setter salva e garante que turbo desliga
                 this.atualizarTurboDisplay(); // Atualiza o display
             }
         }
         // Sobrescreve toJSON para garantir que a propriedade correta está salva
         toJSON() {
             this.outrasProps.turboAtivado = this.turboAtivado; // Atualiza antes de salvar
             return super.toJSON(); // Chama o toJSON do Carro (que chama o do Veiculo)
         }
    }

    class Caminhao extends Carro {
        constructor(modelo, cor, capacidadeCarga, outrasProps = {}) {
            // Garante 'cargaAtual' e 'capacidadeCarga'
            super(modelo, cor, 'caminhao', { cargaAtual: 0, capacidadeCarga, ...outrasProps });
             // Armazena capacidade também fora de outrasProps para acesso fácil, mas salva em ambas
             this.capacidadeCarga = parseInt(outrasProps.capacidadeCarga) || parseInt(capacidadeCarga) || 5000; // Pega do LS ou param ou padrão
             // Garante que a carga atual não seja maior que a capacidade ao carregar
             this.outrasProps.cargaAtual = Math.min(parseInt(outrasProps.cargaAtual) || 0, this.capacidadeCarga);
            this.inicializarDisplayCaminhao();
        }

        get cargaAtual() { return parseInt(this.outrasProps.cargaAtual) || 0; }
        set cargaAtual(valor) {
             const novaCarga = Math.max(0, parseInt(valor) || 0); // Garante número >= 0
             if(this.outrasProps.cargaAtual !== novaCarga){
                 this.outrasProps.cargaAtual = novaCarga;
                 salvarGaragem(); // Salva quando a carga muda
             }
         }

        carregar(carga) {
             const cargaNum = parseInt(carga);
             if (isNaN(cargaNum) || cargaNum <= 0) {
                 mostrarMensagem("Insira um valor de carga válido e positivo.", 'error'); return;
             }
             const novaCargaTotal = this.cargaAtual + cargaNum;
            if (novaCargaTotal <= this.capacidadeCarga) {
                this.cargaAtual = novaCargaTotal; // Setter salva
                this.atualizarCargaDisplay();
                mostrarMensagem(`Carregado ${cargaNum}kg. Carga atual: ${this.cargaAtual}kg.`, 'success', 3000);
            } else {
                const espacoLivre = this.capacidadeCarga - this.cargaAtual;
                 mostrarMensagem(`Capacidade máxima (${this.capacidadeCarga}kg) excedida! Só é possível carregar mais ${espacoLivre}kg.`, 'error');
            }
        }

        acelerar() {
            if(!super.acelerar()) return; // Chama Carro.acelerar
            // Ajuste na fórmula para desacelerar mais com carga pesada
            const fatorCarga = Math.max(0.2, 1 - (this.cargaAtual / this.capacidadeCarga));
            this.velocidade += Math.round(Math.max(1, 7 * fatorCarga)); // Aceleração base 7
            this.atualizarVelocidadeDisplay();
        }

        frear() {
            const velAntes = this.velocidade;
            super.frear(); // Chama Carro.frear
            if (velAntes > 0) {
                 // Freia pior com carga
                 const fatorCarga = Math.max(1, 1 + (this.cargaAtual / (this.capacidadeCarga * 1.5)));
                 this.velocidade -= Math.round(Math.max(1, 8 / fatorCarga)); // Frenagem base 8
                 this.velocidade = Math.max(0, this.velocidade);
                 this.atualizarVelocidadeDisplay();
            }
        }

        buzinar() { mostrarMensagem("FOM! FOM! (Caminhão)", 'info', 1500); }

        atualizarCargaDisplay() {
           const cargaEl = document.getElementById(`${this.tipo}-carga`);
           const capEl = document.getElementById(`${this.tipo}-capacidade`);
           if(cargaEl) cargaEl.textContent = this.cargaAtual;
           else console.warn(`Elemento #${this.tipo}-carga não encontrado.`);
           if(capEl) capEl.textContent = this.capacidadeCarga;
           else console.warn(`Elemento #${this.tipo}-capacidade não encontrado.`);

           // Limpa o input GERAL de carga após tentar carregar
           const cargaInput = document.getElementById('carga');
           if(cargaInput) cargaInput.value = '';
            // Salvar é feito pelo setter agora
        }
        inicializarDisplayCaminhao(){
            this.inicializarDisplayBase(); // Chama base do Veiculo
            this.atualizarCargaDisplay(); // Atualiza display de carga/capacidade
        }
         // Garante que carga e capacidade estão em outrasProps ao salvar
         toJSON() {
             this.outrasProps.cargaAtual = this.cargaAtual;
             this.outrasProps.capacidadeCarga = this.capacidadeCarga;
             return super.toJSON(); // Chama toJSON do Carro
         }
    }

    class Moto extends Veiculo {
         constructor(modelo, cor, outrasProps = {}) {
             super(modelo, cor, 'moto');
             Object.assign(this.outrasProps, outrasProps);
             this.inicializarDisplayMoto();
         }
        acelerar() {
            if(!super.acelerar()) return;
            this.velocidade += 15;
            this.atualizarVelocidadeDisplay();
        }
        frear() {
            const velAntes = this.velocidade;
            super.frear();
             if (velAntes > 0) {
                 this.velocidade -= 12;
                 this.velocidade = Math.max(0, this.velocidade);
                 this.atualizarVelocidadeDisplay();
             }
        }
        buzinar() { mostrarMensagem("Bip Bip! (Moto)", 'info', 1500); }
         inicializarDisplayMoto(){ this.inicializarDisplayBase(); }
    }

    class Bicicleta extends Veiculo {
        constructor(modelo, cor, outrasProps = {}) {
            super(modelo, cor, 'bicicleta');
            Object.assign(this.outrasProps, outrasProps);
            this.ligado = true; // Sempre "ligada", não depende do estado salvo
            this.inicializarDisplayBicicleta();
        }

        pedalar() { // Acelerar da Bicicleta
            this.velocidade += 2;
            this.atualizarVelocidadeDisplay(); // Não salva LS aqui
            this.atualizarStatusDisplay(); // Atualiza "Em movimento"
        }

        frear() {
            const velAntes = this.velocidade;
            super.frear(); // Chama verificação base
             if (velAntes > 0) {
                 this.velocidade -= 3; // Freia mais rápido que pedala
                 this.velocidade = Math.max(0, this.velocidade);
                 this.atualizarVelocidadeDisplay(); // Não salva LS aqui
                 this.atualizarStatusDisplay(); // Atualiza se parou
             }
        }

        // atualizarStatusDisplay é herdado e já tem a lógica correta

        buzinar() { mostrarMensagem("Trim Trim! (Bicicleta)", 'info', 1500); }

        // Sobrescreve ligar/desligar para não fazer nada ou dar aviso
        ligar() { console.log("Bicicleta está sempre pronta!"); }
        desligar() { mostrarMensagem("Para parar a bicicleta, use o freio.", 'info'); }

        inicializarDisplayBicicleta(){
             this.inicializarDisplayBase(); // Atualiza modelo, cor, status, velocidade
        }

         // Sobrescreve toJSON para simplificar
         toJSON() {
             const data = super.toJSON();
             // Remove 'ligado' e 'velocidade' pois não são estados persistentes relevantes para bike
             delete data.ligado;
             delete data.velocidade; // Opcional: se não quiser salvar a velocidade dela
             return data;
         }
    }

    // --- LocalStorage Functions ---

    /** Salva o estado atual da garagem no LocalStorage. */
    function salvarGaragem() {
        try {
            const dadosParaSalvar = {};
            for (const tipo in veiculos) {
                if (veiculos[tipo] && typeof veiculos[tipo].toJSON === 'function') {
                    dadosParaSalvar[tipo] = veiculos[tipo].toJSON();
                }
            }
            // Só salva se houver algo para salvar
             if (Object.keys(dadosParaSalvar).length > 0) {
                localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dadosParaSalvar));
             } else {
                  localStorage.removeItem(CHAVE_STORAGE); // Limpa se a garagem estiver vazia
             }
            // console.log("Garagem salva."); // Log menos frequente
        } catch (error) {
            console.error("Erro CRÍTICO ao salvar no LocalStorage:", error);
            mostrarMensagem("ERRO GRAVE: Falha ao salvar dados! Verifique o console.", "error", 0); // Mensagem persistente
        }
    }

    /** Carrega os dados da garagem do LocalStorage e recria os objetos. */
    function carregarGaragem() {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
        if (!dadosSalvos) return false; // Não há nada para carregar

        let dadosParseados;
        try {
            dadosParseados = JSON.parse(dadosSalvos);
             if (typeof dadosParseados !== 'object' || dadosParseados === null) {
                  throw new Error("Dados salvos não são um objeto válido.");
             }
        } catch (error) {
            console.error("Erro ao parsear dados do LocalStorage:", error);
            localStorage.removeItem(CHAVE_STORAGE); // Remove dados corrompidos
            mostrarMensagem("Erro ao ler dados salvos (corrompidos?). Iniciando com garagem padrão.", "error");
            return false;
        }

        veiculos = {}; // Limpa o objeto atual antes de carregar
        let carregouAlgoValido = false;

        for (const tipo in dadosParseados) {
            const veiculoData = dadosParseados[tipo];
             // Validação mínima dos dados carregados para cada veículo
             if (!veiculoData || !veiculoData.tipo || !veiculoData.modelo) {
                  console.warn(`Dados inválidos para veículo tipo "${tipo}" no localStorage. Pulando.`);
                  continue;
             }
             // Verifica se o tipo no dado corresponde à chave (segurança extra)
              if (veiculoData.tipo !== tipo) {
                   console.warn(`Inconsistência de tipo para veículo "${tipo}". Pulando.`);
                   continue;
              }

            try { // Try-catch para cada veículo, para um não quebrar os outros
                let novoVeiculo;
                const outrasProps = veiculoData.outrasProps || {};

                // Recria a instância da classe correta
                switch (tipo) {
                    case 'carro':       novoVeiculo = new Carro(veiculoData.modelo, veiculoData.cor, tipo, outrasProps); break;
                    case 'esportivo':   novoVeiculo = new CarroEsportivo(veiculoData.modelo, veiculoData.cor, outrasProps); break;
                    case 'caminhao':
                        const capacidade = parseInt(outrasProps.capacidadeCarga) || 5000;
                        novoVeiculo = new Caminhao(veiculoData.modelo, veiculoData.cor, capacidade, outrasProps); break;
                    case 'moto':        novoVeiculo = new Moto(veiculoData.modelo, veiculoData.cor, outrasProps); break;
                    case 'bicicleta':   novoVeiculo = new Bicicleta(veiculoData.modelo, veiculoData.cor, outrasProps); break;
                    default:            throw new Error(`Tipo de veículo desconhecido: ${tipo}`);
                }

                // Restaura estado básico (se aplicável e presente)
                 if (!(novoVeiculo instanceof Bicicleta)) { // Bike não tem estado 'ligado' persistente
                     novoVeiculo.ligado = veiculoData.ligado === true;
                 }
                novoVeiculo.velocidade = parseInt(veiculoData.velocidade) || 0;

                // Carrega o histórico de manutenção
                if (veiculoData.historicoManutencao) {
                    novoVeiculo.manutencao.carregarHistorico(veiculoData.historicoManutencao);
                }

                veiculos[tipo] = novoVeiculo; // Adiciona ao mapa de veículos ativos
                carregouAlgoValido = true;

             } catch (error) {
                  console.error(`Erro ao recriar veículo tipo "${tipo}" do LocalStorage:`, error, veiculoData);
                   mostrarMensagem(`Erro ao carregar dados do ${tipo}. Verifique o console.`, "error");
             }
        } // Fim do loop for-in

        // Após carregar todos, inicializa os displays dos veículos válidos
        Object.values(veiculos).forEach(v => {
             if (v && typeof v.inicializarDisplayBase === 'function') {
                 v.inicializarDisplayBase();
             }
         });

         if(carregouAlgoValido){
             console.log("Garagem carregada do LocalStorage.");
             atualizarDisplayAgendamentosFuturos();
             verificarAgendamentosProximos(); // Verifica lembretes
             return true;
         } else {
              console.warn("Nenhum dado de veículo válido foi carregado do LocalStorage.");
              mostrarMensagem("Dados salvos parecem inválidos. Iniciando com garagem padrão.", "error");
              return false; // Falhou em carregar algo útil
         }
    }

    // --- Funções de Exibição e Lembretes ---

    /** Atualiza a lista de agendamentos futuros na interface. */
    function atualizarDisplayAgendamentosFuturos() {
        if (!agendamentosFuturosListaEl) return; // Elemento não existe

        const todosAgendamentos = [];
        for (const tipo in veiculos) {
             if (veiculos[tipo] && veiculos[tipo].manutencao) {
                const agendamentosVeiculo = veiculos[tipo].manutencao.getAgendamentosFuturos();
                agendamentosVeiculo.forEach(ag => {
                    todosAgendamentos.push({
                        veiculo: `${veiculos[tipo].tipo.charAt(0).toUpperCase() + veiculos[tipo].tipo.slice(1)} (${veiculos[tipo].modelo})`,
                        servico: ag // O objeto Manutencao completo
                    });
                });
            }
        }

        // Ordena por data/hora (do mais próximo para o mais distante)
        todosAgendamentos.sort((a, b) => {
             const dateA = a.servico._dataObj || new Date(8640000000000000); // Data máxima se inválida
             const dateB = b.servico._dataObj || new Date(8640000000000000);
             return dateA - dateB; // Ordem crescente de data
        });

        agendamentosFuturosListaEl.innerHTML = ''; // Limpa a lista
        if (todosAgendamentos.length === 0) {
            agendamentosFuturosListaEl.innerHTML = '<li>Nenhum agendamento futuro.</li>';
        } else {
            todosAgendamentos.forEach(item => {
                const li = document.createElement('li');
                 li.innerHTML = `<strong>${item.veiculo}:</strong> ${item.servico.toString(false)}`; // Sem custo
                 li.title = `Agendado para: ${item.servico._dataObj ? item.servico._dataObj.toLocaleString('pt-BR') : 'Data inválida'}`;
                agendamentosFuturosListaEl.appendChild(li);
            });
        }
    }

    /** Verifica se há agendamentos para hoje ou amanhã e exibe lembrete. */
    function verificarAgendamentosProximos() {
         const hoje = new Date();
         const amanha = new Date();
         amanha.setDate(hoje.getDate() + 1);
         // Zera horas/minutos/segundos para comparar apenas a data
         hoje.setHours(0, 0, 0, 0);
         amanha.setHours(0, 0, 0, 0);

        let lembretes = [];
        for (const tipo in veiculos) {
            if (veiculos[tipo] && veiculos[tipo].manutencao) {
                // Pega todos os serviços, não apenas futuros, para lembretes
                veiculos[tipo].manutencao.getHistoricoCompleto().forEach(servico => {
                     if (servico.tipo.toLowerCase() === 'agendada' && servico._dataObj) {
                        const dataServico = new Date(servico._dataObj);
                        dataServico.setHours(0,0,0,0); // Compara só a data

                         let diaPrefixo = "";
                         if (dataServico.getTime() === hoje.getTime()) diaPrefixo = "HOJE";
                         else if (dataServico.getTime() === amanha.getTime()) diaPrefixo = "Amanhã";

                         if(diaPrefixo){
                              let horaTexto = servico.hora ? ` às ${servico.hora}` : '';
                              let descTexto = servico.descricao ? ` (${servico.descricao})` : '';
                              lembretes.push(`${diaPrefixo}: ${veiculos[tipo].modelo} - ${servico.tipo}${horaTexto}${descTexto}`);
                         }
                    }
                });
            }
        }

        if (lembretes.length > 0) {
             // Mostra os lembretes separados por ponto e vírgula
            mostrarMensagem(`Lembretes: ${lembretes.join('; ')}`, 'info', 15000); // Mostra por 15s
        }
    }

    // --- Funções da API Simulada (NOVO) ---

    /**
     * Busca detalhes extras de um veículo na API simulada (arquivo JSON local).
     * @param {string} identificadorVeiculo O tipo do veículo (ex: 'carro', 'esportivo').
     * @returns {Promise<object|null>} Uma Promise que resolve com os dados do veículo ou null se não encontrado/erro.
     */
    async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
        const url = './dados_veiculos_api.json'; // Caminho para o seu arquivo JSON
        try {
            const response = await fetch(url);

            if (!response.ok) {
                // Se a resposta não for OK (ex: 404 Not Found), lança um erro
                throw new Error(`Erro ao buscar dados da API: ${response.status} ${response.statusText}`);
            }

            // Tenta parsear a resposta como JSON
            const dadosTodosVeiculos = await response.json();

            // Procura pelo veículo específico no array retornado
            const detalhesVeiculo = dadosTodosVeiculos.find(veiculo => veiculo.identificador === identificadorVeiculo);

            // Retorna os detalhes encontrados ou null se não achou
            return detalhesVeiculo || null;

        } catch (error) {
            console.error(`Falha ao buscar ou processar detalhes do veículo (${identificadorVeiculo}):`, error);
            // Em caso de qualquer erro (fetch, JSON parse, etc.), retorna null
            return null;
        }
    }


    // --- Inicialização ---

    function inicializarGaragemPadrao() {
        veiculos = {
            carro: new Carro("Sedan", "Prata"),
            esportivo: new CarroEsportivo("Porsche 911", "Vermelha"),
            caminhao: new Caminhao("Volvo FH", "Branco", 5000),
            moto: new Moto("Harley Fat Boy", "Preto"),
            bicicleta: new Bicicleta("Caloi Explorer", "Azul")
        };
        console.log("Criando veículos padrão.");
        salvarGaragem(); // Salva o estado inicial padrão
        // Atualiza displays iniciais
         Object.values(veiculos).forEach(v => v.inicializarDisplayBase());
         atualizarDisplayAgendamentosFuturos();
    }

    // Tenta carregar do LocalStorage, se falhar, inicializa com padrão
    if (!carregarGaragem()) {
        inicializarGaragemPadrao();
    }

    // Esconde todos os containers de veículos inicialmente
    const esconderTodosVeiculos = () => {
      document.querySelectorAll('.veiculo-container').forEach(container => {
            container.style.display = 'none';
        });
    }
    esconderTodosVeiculos();

    // Inicializa o Flatpickr para os campos de data
    try {
        const inputsData = document.querySelectorAll('.form-manutencao input[id$="-servico-data"]');
        if (inputsData.length > 0) {
            flatpickr(inputsData, { // Pode passar NodeList diretamente
                dateFormat: "d/m/Y",
                locale: "pt",
                allowInput: true,
                disableMobile: true // Recomendado para consistência
            });
            console.log(`Flatpickr inicializado para ${inputsData.length} campos de data.`);
        } else {
            console.warn("Nenhum input de data encontrado para inicializar o Flatpickr.");
        }
    } catch (error) {
        console.error("Erro ao inicializar o Flatpickr:", error);
        mostrarMensagem("Erro ao carregar o calendário de datas.", "error");
    }

    // --- Event Listeners ---

    // Event listener para seleção de veículo
    document.querySelectorAll('#veiculo-selection button').forEach(button => {
        button.addEventListener('click', function() {
            esconderTodosVeiculos();
            const veiculoTipo = this.dataset.veiculo;
            const container = document.getElementById(`${veiculoTipo}-container`);
            if(container) {
                // Mostra como flex para o layout interno funcionar
                container.style.display = 'flex'; // <- MUDADO PARA FLEX
                // Garante que o histórico está atualizado ao exibir
                if(veiculos[veiculoTipo] && veiculos[veiculoTipo].manutencao) {
                    veiculos[veiculoTipo].manutencao.atualizarDisplayHistorico();
                } else {
                     console.error(`Veículo ou gerenciador de manutenção para ${veiculoTipo} não encontrado ao tentar exibir.`);
                }
                // Esconde a área de detalhes da API ao selecionar um novo veículo
                const detalhesContainer = container.querySelector('.detalhes-api-container');
                if(detalhesContainer) {
                    detalhesContainer.style.display = 'none';
                    detalhesContainer.innerHTML = ''; // Limpa o conteúdo
                }

            } else {
                console.error(`Container HTML #${veiculoTipo}-container não encontrado.`);
                 mostrarMensagem(`Erro: container para ${veiculoTipo} não existe no HTML.`, 'error');
            }
        });
    });

    // Event listener DELEGADO para ações dentro do #container principal
    document.getElementById('container').addEventListener('click', function(event) {
        const target = event.target;

        // Processa apenas BOTÕES com data-acao e data-tipo
        if (target.tagName === 'BUTTON' && target.dataset.acao && target.dataset.tipo) {
            const acao = target.dataset.acao;
            const tipo = target.dataset.tipo;
            const veiculo = veiculos[tipo];

            if (!veiculo && acao !== 'verDetalhes') { // Permite verDetalhes mesmo sem objeto JS (embora não ideal)
                console.error(`Objeto veículo ${tipo} não encontrado (ação: ${acao}).`);
                mostrarMensagem(`Erro interno: Veículo ${tipo} não existe.`, 'error');
                return;
            }

            // Executa a ação com tratamento de erro
            try {
                switch (acao) {
                    case 'ligar':           if(veiculo) veiculo.ligar(); break;
                    case 'desligar':        if(veiculo) veiculo.desligar(); break;
                    case 'acelerar':        if(veiculo) veiculo.acelerar(); break;
                    case 'frear':           if(veiculo) veiculo.frear(); break;
                    case 'buzinar':         if(veiculo) veiculo.buzinar(); break;
                    case 'ativarTurbo':     if (veiculo instanceof CarroEsportivo) veiculo.ativarTurbo(); else console.warn("Ação 'ativarTurbo' inválida para", tipo); break;
                    case 'desativarTurbo':  if (veiculo instanceof CarroEsportivo) veiculo.desativarTurbo(); else console.warn("Ação 'desativarTurbo' inválida para", tipo); break;
                    case 'carregar':        if (veiculo instanceof Caminhao) {
                                                const cargaInput = document.getElementById('carga');
                                                if(cargaInput) veiculo.carregar(cargaInput.value);
                                                else mostrarMensagem("Erro: Campo de carga não encontrado.", "error");
                                            } else console.warn("Ação 'carregar' inválida para", tipo); break;
                    case 'pedalar':         if (veiculo instanceof Bicicleta) veiculo.pedalar(); else console.warn("Ação 'pedalar' inválida para", tipo); break;

                    case 'verDetalhes': // <<< NOVO CASE ADICIONADO AQUI
                        // Pega o elemento onde os detalhes serão exibidos
                        const detalhesContainer = document.getElementById(`${tipo}-detalhes-api`);
                        if (!detalhesContainer) {
                             console.error(`Elemento #${tipo}-detalhes-api não encontrado no HTML.`);
                             mostrarMensagem(`Erro: Área para exibir detalhes de ${tipo} não encontrada.`, 'error');
                             break; // Sai do case se não encontrar onde mostrar
                        }

                        // Mostra mensagem de carregando e limpa conteúdo anterior
                        detalhesContainer.innerHTML = '<em>Carregando detalhes...</em>';
                        detalhesContainer.style.display = 'block'; // Torna a área visível

                        // Chama a função assíncrona para buscar os dados
                        // Usamos uma função anônima async dentro do case para poder usar await
                        (async () => {
                            try {
                                const detalhes = await buscarDetalhesVeiculoAPI(tipo);

                                // Verifica o resultado da busca
                                if (detalhes) {
                                    // Constrói o HTML para exibir os detalhes
                                    let htmlDetalhes = `<h4>Detalhes Extras (API)</h4>`;
                                    htmlDetalhes += `<p><strong>Valor FIPE:</strong> ${detalhes.valorFIPE || 'N/D'}</p>`;
                                    htmlDetalhes += `<p><strong>Recall Pendente:</strong> ${detalhes.recallPendente ? `<span style="color:red; font-weight:bold;">SIM</span> ${detalhes.recallDetalhe ? `(${detalhes.recallDetalhe})` : ''}` : 'Não'}</p>`;
                                    htmlDetalhes += `<p><strong>Dica de Manutenção:</strong> ${detalhes.dicaManutencao || 'Nenhuma dica disponível.'}</p>`;
                                    htmlDetalhes += `<p><strong>Última Revisão (API):</strong> ${detalhes.ultimaRevisaoAPI || 'N/D'}</p>`;

                                    detalhesContainer.innerHTML = htmlDetalhes;
                                } else {
                                    // Se retornou null, pode ser não encontrado ou erro na busca
                                    detalhesContainer.innerHTML = '<p style="color: orange;">Detalhes extras não encontrados para este veículo ou falha ao buscar.</p>';
                                }
                            } catch (error) {
                                // Captura erros que possam ocorrer na lógica *após* a busca (embora improváveis aqui)
                                console.error(`Erro ao processar detalhes para ${tipo}:`, error);
                                detalhesContainer.innerHTML = '<p style="color: red;">Erro ao exibir os detalhes. Verifique o console.</p>';
                                mostrarMensagem(`Erro ao exibir detalhes de ${tipo}.`, 'error');
                            }
                        })(); // Chama a função anônima async imediatamente

                        break; // Fim do case 'verDetalhes'


                    case 'adicionarServico':
                        if(!veiculo) break; // Precisa do objeto veículo para adicionar serviço
                        // Encontra o formulário pai do botão clicado
                        const form = target.closest('.form-manutencao');
                        if(!form) { throw new Error("Formulário de manutenção não encontrado."); }

                        // Pega os elementos DENTRO do formulário encontrado
                        const descInput = form.querySelector(`input[id$="-servico-desc"]`);
                        const dataInput = form.querySelector(`input[id$="-servico-data"]`);
                        const horaInput = form.querySelector(`input[id$="-servico-hora"]`);
                        const custoInput = form.querySelector(`input[id$="-servico-custo"]`);
                        const tipoSelect = form.querySelector(`select[id$="-servico-tipo"]`);
                        const tipoHidden = form.querySelector(`input[type=hidden][id$="-servico-tipo"]`);

                        if (!descInput || !dataInput || !horaInput || !custoInput || (!tipoSelect && !tipoHidden)) {
                             throw new Error(`Campos do formulário não encontrados para ${tipo}. Verifique os IDs.`);
                         }

                        const tipoServico = tipoHidden ? tipoHidden.value : tipoSelect.value;

                        // Cria o objeto Manutencao
                        const novoServico = new Manutencao(
                            dataInput.value.trim(),
                            tipoServico,
                            custoInput.value.trim(),
                            descInput.value.trim(),
                            horaInput.value.trim()
                        );

                        // Valida ANTES de adicionar
                        if (novoServico.validar()) {
                             if (veiculo.adicionarServicoManutencao(novoServico)) {
                                 mostrarMensagem("Serviço adicionado/agendado com sucesso!", 'success');
                                 // Limpa campos do formulário específico
                                 descInput.value = '';
                                 // Limpa Flatpickr (se estiver usando)
                                 const fpInstance = dataInput._flatpickr;
                                 if (fpInstance) fpInstance.clear(); else dataInput.value = '';
                                 horaInput.value = '';
                                 custoInput.value = '';
                                 if (tipoSelect) tipoSelect.selectedIndex = 0; // Volta para primeira opção
                             } else {
                                 // A função adicionarServico raramente retornaria false aqui
                                 mostrarMensagem("Falha desconhecida ao adicionar serviço.", 'error');
                             }
                        } // Se validar() falhar, a mensagem de erro já foi mostrada lá
                        break;

                    default:
                        console.warn(`Ação desconhecida: ${acao} para ${tipo}`);
                        mostrarMensagem(`Ação '${acao}' não implementada.`, 'info');
                }
            } catch (error) {
                 console.error(`Erro ao executar ação '${acao}' para ${tipo}:`, error);
                 mostrarMensagem(`Ocorreu um erro inesperado. Verifique o console.`, 'error', 0);
            }
        } // Fim do if (target é botão com data-*)
    }); // Fim do event listener delegado

}); // Fim do DOMContentLoaded