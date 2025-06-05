# Text-to-MIDI Experimental Website - Documentação do Desenvolvedor

## 1. Objetivo do Projeto

Criar um website experimental onde o texto digitado pelo usuário é convertido em música MIDI em tempo real. O usuário poderá escolher escalas musicais, trocar instrumentos MIDI, editar parâmetros básicos das notas (equalização e modulação), dar play/pause na "música" gerada pelo texto e compartilhar sua criação através de uma URL única.

## 2. Tecnologias

*   **Frontend:** HTML5, CSS3, Javascript (ES6+ "Puro", sem frameworks UI).
*   **Áudio/MIDI:** [Tone.js](https://tonejs.github.io/) (utilizar a versão estável mais recente). Tone.js foi escolhido por sua robustez, ampla gama de funcionalidades (síntese, samplers, efeitos, transporte/sequenciamento) e boa documentação.

## 3. Estrutura do Projeto

```
text-to-midi/
├── index.html            # Estrutura principal da página
├── style.css             # Estilos visuais
├── js/                     # Arquivos Javascript
│   ├── main.js           # Lógica principal da aplicação, orquestração e event listeners globais
│   ├── ui.js             # Funções para criação e manipulação dinâmica dos elementos da UI
│   ├── audio.js          # Lógica de áudio, manipulação de MIDI com Tone.js, aplicação de efeitos
│   └── config.js         # Definições de escalas, mapeamentos de notas, configurações de instrumentos
└── dev.md                # Esta documentação
```

**Responsabilidades dos Arquivos Javascript:**

*   `main.js`: Orquestra a aplicação. Inicializa os módulos, gerencia o estado geral (texto atual, configurações selecionadas), manipula eventos de entrada do usuário que não são diretamente ligados a um componente de UI específico (ex: carregar estado da URL), e coordena as ações entre `ui.js` e `audio.js`.
*   `ui.js`: Responsável por gerar e atualizar os elementos da interface do usuário (textarea, botões, dropdowns, sliders para parâmetros). Também lida com eventos específicos desses elementos (ex: clique em um botão, mudança em um select).
*   `audio.js`: Encapsula toda a lógica relacionada ao Tone.js. Isso inclui a inicialização do motor de áudio, carregamento de instrumentos (Synth/Sampler), reprodução de notas individuais, sequenciamento do texto para música, aplicação de efeitos (EQ, modulação) e o controle desses efeitos.
*   `config.js`: Armazena dados de configuração estáticos ou semi-estáticos, como as definições das escalas musicais (mapeamento letra-nota), a lista de instrumentos disponíveis e suas configurações base no Tone.js. Isso facilita a modificação e expansão dessas opções sem alterar a lógica principal.

## 4. Funcionalidades Principais

*   **Digitação com Feedback Sonoro:**
    *   Cada letra digitada no campo de texto principal dispara a reprodução de uma nota musical correspondente.
    *   Espaços resultam em silêncio (ou uma pausa curta).
    *   A nota tocada depende da escala musical selecionada.
*   **Seleção de Escala Musical:**
    *   Um controle (dropdown) permite ao usuário escolher entre diferentes escalas musicais (ex: C Major, G Major, A Minor Pentatonic).
    *   A escala padrão é C Major.
    *   O mapeamento letra-nota será fixo por escala inicialmente.
*   **Seleção de Instrumento MIDI:**
    *   Um controle (dropdown) permite ao usuário escolher entre diferentes instrumentos MIDI (ex: Piano, Synth Lead, Violão).
    *   O instrumento padrão é Piano.
*   **Edição de Parâmetros da Nota MIDI:**
    *   Controles (sliders) permitirão ao usuário ajustar parâmetros de:
        *   Equalização (ex: graves, médios, agudos).
        *   Modulação (ex: taxa e profundidade de um LFO afetando o pitch ou amplitude - vibrato/tremolo).
*   **Controles de Play/Pause:**
    *   Um botão permite ao usuário tocar a sequência de notas correspondente ao texto inteiro digitado, do início ao fim.
    *   O mesmo botão permite pausar e retomar a reprodução.
*   **Compartilhamento:**
    *   Um botão "Compartilhar" gera uma URL única.
    *   Esta URL contém o texto digitado, a escala selecionada, o instrumento e todos os parâmetros ajustados.
    *   Abrir esta URL em outro navegador deve recriar exatamente a mesma configuração e "música".

## 5. Roteiro de Desenvolvimento (Fases)

1.  **Fase 1: Estrutura do Projeto e Documentação Inicial (Concluída)**
    *   Criação da estrutura de pastas e arquivos.
    *   Elaboração desta documentação (`dev.md`) inicial.
2.  **Fase 2: Funcionalidade Principal - Texto para Som (Piano, C Major)**
    *   Implementação da UI básica (textarea, botão play/pause).
    *   Configuração inicial do Tone.js para tocar notas de piano.
    *   Mapeamento básico letra-nota para C Major.
    *   Feedback sonoro ao digitar.
    *   Funcionalidade básica de Play/Pause para o texto.
3.  **Fase 3: Funcionalidades Adicionais - Controles e Configurações**
    *   Implementação da seleção de escala musical.
    *   Implementação da troca de instrumento MIDI.
    *   Implementação da edição de parâmetros de nota (EQ e Modulação).
4.  **Fase 4: Compartilhamento**
    *   Implementação da geração de URL de compartilhamento.
    *   Implementação do carregamento do estado da aplicação a partir da URL.
5.  **Fase 5: Refinamento, Testes e Documentação Final**
    *   Testes manuais abrangentes.
    *   Melhorias de UI/UX.
    *   Revisão de código (clareza, performance, manutenibilidade).
    *   Atualização final da documentação.

## 6. Considerações de Escalabilidade e Manutenibilidade

*   **Modularização:** O código Javascript é dividido em módulos (`main.js`, `ui.js`, `audio.js`, `config.js`) com responsabilidades bem definidas para facilitar a compreensão, manutenção e testes.
*   **Configuração Centralizada:** `config.js` permite fácil adição/modificação de escalas, instrumentos e seus parâmetros sem necessidade de alterar a lógica central.
*   **Abstração da Biblioteca de Áudio:** `audio.js` atua como uma camada de abstração sobre o Tone.js. Se no futuro for necessário trocar de biblioteca de áudio, as alterações ficariam mais contidas neste arquivo.
*   **Funções Puras:** Onde aplicável, usar funções puras para facilitar o rastreamento de dados e testes.
*   **Comentários:** Código complexo ou decisões de design importantes serão comentadas.
*   **Sem Framework de UI:** A escolha por Javascript puro, embora possa exigir mais código boilerplate para a UI, mantém o projeto leve e com poucas dependências externas, focando na lógica principal da aplicação. Para um projeto experimental deste escopo, é uma abordagem válida. Em projetos maiores, um framework poderia ser benéfico.
*   **Estado da Aplicação:** O estado será gerenciado de forma simples, principalmente através de variáveis em `main.js` e refletido na UI e no áudio. Para aplicações mais complexas, um gerenciador de estado mais robusto poderia ser considerado.
*   **Carregamento de Amostras (Samplers):** Para instrumentos como piano e violão, o Tone.js `Sampler` precisará de arquivos de áudio. Inicialmente, podemos usar URLs de amostras disponíveis publicamente ou amostras muito pequenas para simplificar. Em uma versão mais robusta, um gerenciamento de assets seria necessário.

## 7. Próximos Passos Imediatos (Início da Fase 2)

*   Configurar o `index.html` com os elementos básicos da UI (textarea, botão play/pause).
*   Incluir o Tone.js no projeto (via CDN para começar).
*   Escrever a lógica inicial em `audio.js` para inicializar o Tone.js e tocar uma nota de piano simples.
*   Criar o mapeamento inicial de letras para notas da escala C Major em `config.js`.
*   Implementar o event listener em `main.js` para capturar a digitação no textarea e chamar a função de tocar nota.

---
*Este documento será atualizado conforme o projeto evolui.* 