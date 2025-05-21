# Garagem Inteligente Unificada

Este projeto simula uma garagem inteligente onde você pode gerenciar diferentes tipos de veículos, suas ações e histórico de manutenção. O projeto foi desenvolvido utilizando HTML, CSS e JavaScript com Programação Orientada a Objetos (POO), e documentado com o auxílio de IA.

## Visão Geral

A "Garagem Inteligente Unificada" permite ao usuário selecionar um tipo de veículo (Carro Casual, Carro Esportivo, Caminhão, Moto, Bicicleta) e interagir com ele através de uma interface web. As funcionalidades incluem ligar/desligar, acelerar/frear, buzinar, e ações específicas como ativar turbo (para carros esportivos) ou carregar carga (para caminhões). Além disso, cada veículo possui um sistema de registro e agendamento de manutenções.

## Funcionalidades Principais

*   **Seleção de Veículos:** Interface para escolher entre diferentes tipos de veículos.
*   **Interação Individual:** Cada veículo possui um conjunto de ações específicas:
    *   **Veiculo (Base):** Ligar, Desligar, Acelerar, Frear, Buzinar.
    *   **Carro Esportivo:** Ativar/Desativar Turbo.
    *   **Caminhão:** Carregar Carga.
    *   **Bicicleta:** Pedalar.
*   **Gerenciamento de Manutenções:**
    *   Adicionar serviços de manutenção (Preventiva, Corretiva, Agendada, Ajuste).
    *   Visualizar histórico de manutenções para cada veículo.
    *   Agendar serviços futuros.
*   **Persistência de Dados:** As informações dos veículos e seus históricos de manutenção são salvos no LocalStorage do navegador, permitindo que os dados persistam entre as sessões.
*   **Detalhes Extras (Simulado):** Botão para simular a busca de informações adicionais de uma API para cada veículo.
*   **Design Responsivo:** Interface adaptada para diferentes tamanhos de tela (básico).
*   **Documentação JSDoc:** O código JavaScript das classes e métodos está documentado usando o padrão JSDoc para facilitar o entendimento e a manutenção.

## Estrutura do Projeto

O código está organizado da seguinte forma:

*   `index.html`: Estrutura principal da página.
*   `style.css`: Estilização visual da interface.
*   `js/`: Pasta contendo os scripts JavaScript:
    *   `Manutencao.js`: Classe para representar os registros de manutenção.
    *   `Veiculo.js`: Classe base para todos os veículos.
    *   `Carro.js`, `CarroEsportivo.js`, `Caminhao.js`, `Moto.js`, `Bicicleta.js`: Classes específicas para cada tipo de veículo, herdando de `Veiculo`.
    *   `Garagem.js`: Script principal que gerencia a lógica da aplicação, instâncias dos veículos e interações com a UI.
    *   `utils.js` (opcional): Funções utilitárias.
*   `img/`: Imagens dos veículos.
*   `README.md`: Este arquivo.

## Tecnologias Utilizadas

*   HTML5
*   CSS3
*   JavaScript (ES6+ Modules, POO)
*   JSDoc (para documentação)
*   Flatpickr (biblioteca para seleção de datas)
*   Google AI Studio (para auxílio na análise e documentação do código - *processo*)

## Como Executar Localmente

1.  Clone este repositório:
    ```bash
    git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
    ```
2.  Navegue até a pasta do projeto:
    ```bash
    cd nome-da-pasta-do-projeto
    ```
3.  Abra o arquivo `index.html` em seu navegador de preferência.

    *Observação: Como o projeto utiliza módulos ES6 (`<script type="module">`), para evitar problemas com CORS ao abrir o `index.html` diretamente do sistema de arquivos (`file:///`), é recomendado servi-lo através de um servidor web local simples. Algumas opções:*
    *   **VS Code Live Server:** Se você usa o VS Code, a extensão "Live Server" é uma ótima opção.
    *   **Python:** Se tiver Python instalado, navegue até a pasta do projeto no terminal e execute:
        ```bash
        python -m http.server
        ```
        (ou `python3 -m http.server` para Python 3)
        Acesse `http://localhost:8000` no navegador.
    *   **Node.js (http-server):** Se tiver Node.js, instale `http-server` globalmente (`npm install -g http-server`) e execute `http-server` na pasta do projeto.

## Próximos Passos / Melhorias Sugeridas (Pós-Missão)

*   [ ] Melhorar a simulação da API de "Detalhes Extras".
*   [ ] Adicionar mais interatividade ou efeitos sonoros.
*   [ ] Implementar testes unitários.
*   [ ] Refinar a responsividade para mais dispositivos.
*   [ ] Adicionar validações mais robustas nos formulários.

## Contato

[Seu Nome/Apelido] - [Seu Email ou Link para Perfil Social]

---
*Este README foi gerado com base na estrutura do projeto "Garagem Inteligente Unificada" e pode ser expandido com o auxílio de ferramentas de IA como o Google AI Studio para detalhar seções específicas.*