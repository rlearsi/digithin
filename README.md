# ⌨️ Digitinho — Jogo de Digitação Arcade

> **Digitinho** é um jogo de digitação arcade moderno, dinâmico e polido construído em **HTML5**, **CSS3 Vanilla** e **JavaScript modular**. Rúnicos (letras, sílabas e palavras) caem em uma coluna inspirada em Tetris enquanto o jogador digita velozmente para acumular pontos, subir de fase, desbloquear palavras em sua Biblioteca e adquirir habilidades arcanas na Loja de Habilidades.

---

## 🎮 Sumário
- [1. Visão Geral](#1-visão-geral)
- [2. Estrutura e Arquitetura do Projeto](#2-estrutura-e-arquitetura-do-projeto)
- [3. Mecânicas do Jogo (Gameplay)](#3-mecânicas-do-jogo-gameplay)
  - [3.1 Os Rúnicos (Tokens)](#31-os-rúnicos-tokens)
  - [3.2 Sistema de Fases e Progressão](#32-sistema-de-fases-e-progressão)
  - [3.3 Sistema de Pontuação Dupla e Penalidades](#33-sistema-de-pontuação-dupla-e-penalidades)
  - [3.4 Vida e Condição de Derrota](#34-vida-e-condição-de-derrota)
- [4. Sistema de Habilidades](#4-sistema-de-habilidades)
- [5. Loja de Habilidades e Economia](#5-loja-de-habilidades-e-economia)
- [6. Biblioteca de Palavras (Bestiário)](#6-biblioteca-de-palavras-bestiário)
- [7. Design, UI e Experiência do Jogador](#7-design-ui-e-experiência-do-jogador)
- [8. Controles e Atalhos de Teclado](#8-controles-e-atalhos-de-teclado)
- [9. Como Executar](#9-como-executar)

---

## 1. Visão Geral

O projeto foi projetado com forte ênfase na estética arcade moderna, feedback tátil e sonoro via síntese em tempo real com **Web Audio API** (sem arquivos externos de áudio) e jogabilidade responsiva.

- **Stack 100% Nativa:** HTML5 semântico, CSS3 Moderno (CSS Grid, Flexbox, Glassmorphism, Neon Glow) e JavaScript Vanilla.
- **Zero Dependências:** Funciona imediatamente tanto no protocolo `file:///` direto no navegador quanto em servidores locais (Apache / LAMPP / Live Server).
- **Design de Arcade:** Fundo escuro com estética minimalista, coluna de jogo centralizada tipo Tetris, barra de fila de rúnicos, efeitos de onda de choque e tela de Game Over cinematográfica com desfoque profundo.

---

## 2. Estrutura e Arquitetura do Projeto

A base de código foi completamente desacoplada em módulos de responsabilidade única dentro das pastas `css/` e `js/`:

```
digitinho/
├── index.html            # Estrutura do jogo, HUD, modais e scripts
├── style.css             # Agregador mestre (@import) dos submódulos de estilo
├── game.js               # Orquestrador principal: loop, colisão, matching e input
├── about.md              # Requisitos e brainstorm inicial
├── README.md             # Esta documentação completa do projeto
├── css/
│   ├── variables.css     # Design tokens, temas claro/escuro, tipografia e reset
│   ├── components.css    # Botões, interruptor de tema, badges de velocidade e tags
│   ├── layout.css        # Telas, HUD, colunas flutuantes em vidro e tabuleiro
│   ├── gameplay.css      # Rúnicos flutuantes, efeitos de partículas, mira e auras
│   ├── modals.css        # Modais de pausa, vitória de fase, loja, biblioteca e game over
│   └── responsive.css    # Media queries e adaptações para viewports menores
└── js/
    ├── audio.js          # Síntese Web Audio API (hit, word, boom, erro, vida, etc.)
    ├── data.js           # Constantes (CFG), tabelas de dados, palavras e habilidades
    ├── state.js          # Definição do estado global e geradores pseudo-aleatórios
    ├── ui.js             # Atualizações de HUD, slots de habilidades, fila e partículas
    ├── shop.js           # Mecânica da loja, cálculo exponencial e compra de itens
    └── library.js        # Bestiário de palavras (descobertas e bloqueadas)
```

### Detalhamento dos Módulos

| Arquivo / Pasta | Responsabilidade Principal |
|---|---|
| **index.html** | Marcação semântica com HUD em grid de 3 colunas, painel lateral esquerdo de desempenho, tabuleiro central, painel direito de habilidades e modais (Loja, Fase, Biblioteca e Game Over). |
| **style.css** | Agregador mestre que importa os estilos da pasta `css/` para compatibilidade total. |
| **css/variables.css** | Tokens de cores do design system, temas escuro e claro, superfícies de vidro fosco (`backdrop-filter`) e reset. |
| **css/components.css** | Componentes reutilizáveis: botões arcade com efeito de elevação, interruptores de tema e badges. |
| **css/layout.css** | Estruturas de layout da tela inicial, barra superior de HUD, colunas laterais flutuantes e tabuleiro. |
| **css/gameplay.css** | Estilização dos rúnicos circulares e em pílula, destaques de digitação, anéis de impacto e feitiços. |
| **css/modals.css** | Camadas de overlay de vidro fosco (`blur(30px)`), modais de loja, biblioteca, pausa e tela de vitória. |
| **css/responsive.css** | Ajustes adaptativos para dispositivos e resoluções compactas. |
| **game.js** | Loop principal `requestAnimationFrame`, captura de teclas no evento `keydown`, algoritmo de digitação por prefixo, detecção de erros e acionamento de habilidades. |
| **js/audio.js** | Sintetizador de ondas sonoras (senoidal, dente de serra, triângulo e ruído branco) para respostas táteis e imediatas sem latência de rede. |
| **js/data.js** | Dicionário de 30 palavras divididas por categorias temáticas, 50 sílabas, palavras coringa, lista de habilidades e regra de metas de fase (`calcPhaseGoal`). |
| **js/state.js** | Inicializador `defaultState()` garantindo estado previsível para novas partidas ou resets, além de funções auxiliares como `pick()`, `shuffle()` e `uid()`. |
| **js/ui.js** | Atualização dos elementos de tela, slots de habilidades sem cortes de badge, barra de fila (`PRÓXIMOS`) e efeitos de partículas direcionais. |
| **js/shop.js** | Geração de catálogo aleatório (3 itens), cálculo de custo com fator de escala exponencial `1.45` e entrega de habilidades ou palavras secretas. |
| **js/library.js** | Visualização do Bestiário com contadores de descobertas e frequência de digitação, com pausamento automático do jogo em segundo plano. |

---

## 3. Mecânicas do Jogo (Gameplay)

### 3.1 Os Rúnicos (Tokens) e a Progressão por Temperatura de Cor
Os itens que caem do topo da tela são denominados **Rúnicos**. Suas cores de fundo seguem uma **ordem térmica intuitiva** (da menor temperatura perceptual à maior energia incandescente), reservando o tom carmesim exclusivamente para o alarme de perigo ao atingir a base:

| Tipo de Rúnico | Temperatura / Nível | Exemplo | Pontuação Base | Visual e Estilo |
|---|---|---|---|---|
| **Letra** | ❄️ **Fria (Gélida)** | `A`, `B`, `K` | **1 ponto** | Círculo azul real (`#2563EB`) de 44px com texto branco |
| **Sílaba** | 🌿 **Temperada (Fresca)** | `CA`, `PRA`, `VI` | **3 pontos** | Pílula verde esmeralda (`#059669`) |
| **Palavra** | ☀️ **Quente (Solar)** | `GATO`, `VULCAO` | **3 pts × letras** (ex: GATO = 12pts) | Pílula âmbar dourado (`#D97706`) |
| **Palavra com Habilidade** | ⚡ **Incandescente (Plasma)** | `ESTRELA ⚡` | Pontuação da palavra + **Habilidade Arcana** | Pílula magenta radiante (`#D946EF`), aura estelar e badge de raio `⚡` |
| **Palavra Coringa** | 💥 **Cósmica / Caos** | `BOOM`, `BANG`, `NOVA` | **10 pts base + Pontos da tela toda** | Pílula violeta (`#8B5CF6`) e badge `💥` |
| **🚨 Estado de Perigo** | 🔥 **Alarme Crítico** | Qualquer rúnico próximo ao fundo | — | Transforma-se em vermelho alerta vivo (`#DC2626`) com pulso luminoso (`animation: dangerPulse`) |

> **Comportamento do Coringa:** Ao completar a digitação de uma palavra coringa, todos os rúnicos ativos na tela explodem em partículas simultaneamente, e todos os seus respectivos pontos são absorvidos de uma vez só!

#### Fila de Próximos (`PRÓXIMOS`) com Feedback Gradual de Proximidade:
A esteira horizontal pré-visualiza os próximos 6 rúnicos com um efeito de profundidade visual por opacidade gradativa:
- **1º Rúnico (Próximo Imediato):** Opacidade 100% (`1.0`) — máxima nitidez e destaque.
- **2º Rúnico:** Opacidade 85% (`0.85`)
- **3º Rúnico:** Opacidade 65% (`0.65`)
- **4º Rúnico:** Opacidade 45% (`0.45`)
- **5º Rúnico:** Opacidade 30% (`0.30`)
- **6º Rúnico (Fundo da Fila):** Opacidade 18% (`0.18`) — silhueta suave.

Esse gradiente dinâmico oferece feedback visual tátil e imediato ao jogador sobre a ordem cronológica de queda. Além disso, as letras contam com proteção contra deformação (`flex-shrink: 0`, `min-width: 28px`, `aspect-ratio: 1/1`), mantendo círculos perfeitos mesmo na presença de palavras extensas.

### 3.2 Sistema de Fases e Progressão
A barra de progresso no centro do HUD avança conforme os rúnicos são digitados com sucesso. Ao atingir a meta da fase:
- O jogo é pausado imediatamente com chuva festiva de **confetes coloridos** e áudio suave de fogos de artifício.
- O modal de fase completa exibe o resumo financeiro dos pontos e desbloqueia **3 palavras aleatórias** para o acervo do jogador.
- Ao iniciar uma nova fase:
  - **A velocidade adicional acumulada é reiniciada para 1.0×** (`baseSpeed`).
  - **O contador de combo e o Modo Fúria são reiniciados para 0×**.

#### Metas de Cada Fase:
- **Fase 1:** **10 pontos**
- **Fase 2:** **20 pontos**
- **Fase 3:** **30 pontos**
- **Fase 4:** **40 pontos**
- **Fase 5:** **50 pontos**
- **Fase 6 em diante:** **Progressão linear (+10 pontos a cada nova fase)**: $\text{Meta} = \text{Fase} \times 10$

### 3.3 Sistema de Pontuação Dupla e Penalidades

1. **Pontos da Fase (`FASE`):**
   - Pontos ganhos na fase atual através de digitação, palavras completas e explosões.
   - **Não são adicionados aos pontos totais imediatamente.**
2. **Pontos Totais Acumulados (`TOTAL`):**
   - Saldo bancado definitivo usado como moeda na Loja de Habilidades, formatado em destaque com 10 dígitos (ex.: `0000098120`).
3. **Penalidade por Erro de Digitação:**
   - **Trava de Proteção (Campo Vazio):** Caso não haja nenhum rúnico (letra, sílaba ou palavra) ativo no tabuleiro deslizante no momento da digitação, o sistema **bloqueia qualquer penalidade**. Nenhuma pontuação é descontada, a barra de progresso não diminui, o multiplicador de velocidade não sobe e nenhum erro é contabilizado.
   - **Punição Condicional:** Se houver rúnicos visíveis em tela e o jogador digitar uma tecla incorreta:
     - Ocorre um flash vermelho e reduz-se a barra de progresso em 3 unidades.
     - A velocidade de queda aumenta em `+0.1×` (acumulativa durante a partida).
     - O contador de **ERROS** é incrementado.
     - **Regra de Dedução:** A cada 1 erro cometido durante a fase, desconta-se 1 ponto do ganho daquela fase **apenas no momento da apuração final**:
       $$\text{Pontos Adicionados} = \max(0, \text{Pontos da Fase} - \text{Erros da Fase})$$

### 3.4 Vida e Condição de Derrota
- O jogador inicia a partida com **3 vidas** (❤️ ❤️ ❤️).
- Se um rúnico atinge o final da coluna (exceto se a **Imunidade** estiver ativa), o jogador perde 1 vida e a tela treme.
- Quando as vidas chegam a zero, a tela de **Game Over** é acionada. Se o jogador possuir **Fichas Continue** compradas na loja, pode utilizá-las para continuar imediatamente da fase onde parou.

### 3.5 Sistema de Combo & Modo Fúria (Streak)
- **Acertos Consecutivos:** A cada rúnico digitado com sucesso sem cometer erros, o contador de combo aumenta:
  - **1 a 4 acertos:** Multiplicador normal ($1\times$).
  - **5 a 9 acertos:** Multiplicador dobrado ($2\times$).
  - **10 a 14 acertos:** Multiplicador triplo ($3\times$).
  - **15+ acertos — MODO FÚRIA (Flow State):** Multiplicador quádruplo ($4\times$) que **dobra novamente** no modo fúria (totalizando até **$8\times$ pontos**!).
- **Efeitos Visuais e Sonoros do Modo Fúria:** O tabuleiro emite uma aura dourada pulsante (`.fury-mode`) e acordes musicais harmônicos sobem a energia da partida.
- **Quebra de Sequência:** Ao digitar uma tecla errada ou deixar um rúnico cair, o combo quebra e retorna para zero. O combo também é reiniciado no início de cada nova fase.

### 3.6 Modos de Jogo Disponíveis
1. **Modo Clássico:** A experiência arcade completa com vidas, fases progressivas, metas crescentes e loja.
2. **Modo Treinamento por Linhas do Teclado (Didática Estruturada):** Método pedagógico para desenvolver memória muscular sem olhar para o teclado. Dividido em 4 Mundos (Linha Base, Linha Superior, Linha Inferior e Acentos/Pontuações), cada um contendo **3 lições estruturadas com início, objetivo claro e fim comemorativo**:
   - **Lição 1 (Teclas Base):** 10 rúnicos isolados para fixação neuromuscular da posição de repouso dos dedos (`10/10`).
   - **Lição 2 (Alternância de Mãos):** 15 rúnicos misturando teclas e palavras curtas para agilidade (`15/15`).
   - **Lição 3 (Desafio Final de Maestria):** 20 rúnicos com vocábulos completos daquela linha (`20/20`). Ao concluir, concede o selo permanente de **Mundo Dominado** no `localStorage` com métricas consolidadas de PPM e precisão.
   - **Sistema de Recorde de Precisão & Repetição:** Para os desafios concluídos, o card exibe o selo com a **Melhor Precisão (Recorde %)** alcançada (ex: `🎯 Recorde: 98.5% Precisão`), incentivando o jogador a repetir o treino para superar sua pontuação. O modal de conclusão destaca quando um novo recorde histórico é batido (`🌟 NOVO RECORDE!`).
3. **Modo Zen (Treino Livre):** Perfeito para iniciantes ou crianças. Sem perda de vidas, permitindo praticar digitação no seu próprio ritmo sem estresse de Game Over. A informação é exibida de forma fixa e elegante no topo do HUD (`🧘 Modo Zen: sem perda de vidas`) e no contador de vidas (`🧘 Sem perda de vidas`), eliminando avisos flutuantes invasivos no centro da tela quando vocábulos tocam a base.
4. **Modo Contra o Relógio (Time Attack 60s):** Corrida eletrizante de 60 segundos com cronômetro regressivo. Digite o máximo de palavras e acumule o recorde de pontuação antes do tempo esgotar!

### 3.7 Batalhas Épicas de Chefões (Boss Battles por Cenário)
A cada 10 fases da jornada (fases 10, 20, 30, 40, 50, 60…), o fluxo normal de rúnicos é interrompido para o confronto contra um **Chefão Guardião**. Cada chefão representa um **cenário autêntico**, possui um **tipo exclusivo** (apenas 1 chefão por tipo) e apresenta enigmas e vocabulários **estritamente temáticos e compatíveis com a sua natureza**:

| Fase | Chefão | Tipo Único | Cenário Temático | Universo dos Enigmas e Significados |
|:---:|:---|:---:|:---|:---|
| **10** | **Cyber-Titã Lexis** | `robot` | **Metrópole Cibernética** | **Tecnologia & Computação:** chips de silício, feixes laser, circuitos impressos, redes de alta velocidade, pacotes de dados, robôs autônomos, código binário. |
| **20** | **Rex-Primus, o Soberano Feral** | `beast` | **Savana Primordial** | **Fauna Selvagem & Predadores:** leões alfas, lobos em alcateia, tigres solitários, águias de rapina, garras de caça, instintos predatórios. |
| **30** | **Quimera Arcana de Delfos** | `mythology` | **Templo Místico de Delfos** | **Mitologia Clássica & Criaturas Lendárias:** dragões alados, fênix imortais, hidras regenerativas, grifos de ouro, enigmas de esfinge, oráculos sagrados. |
| **40** | **Leviatã do Abismo Profundo** | `ocean` | **Fossa Oceânica Abissal** | **Biologia Marinha & Abismos Oceânicos:** tubarões elétricos, recifes de coral, fossas pelágicas, cefalópodes inteligentes, baleias titânicas, tsunamis. |
| **50** | **Astro-Titã Cronos** | `cosmos` | **Nebulosa Estelar & Vácuo** | **Astrofísica, Estrelas & Espaço:** fusão de plasma estelar, órbitas planetárias, galáxias espirais, estrelas pulsar, cometas errantes, gravidade cósmica. |
| **60** | **Vulcanus, o Colosso de Magma** | `volcano` | **Caldeira Vulcânica & Núcleo** | **Vulcanologia & Geologia Ígnea:** câmaras de magma, fluxos de lava incandescente, nuvens de cinzas, colunas de basalto, crateras ativas, forjas tectônicas. |

#### Dinâmica do Duelo:
1. **Entrada Triunfal:** O chefão surge flutuando no topo da arena com avatar vetorial em SVG animado, halo luminoso personalizado na cor do seu bioma e medidor arcade de **Pontos de Vida: `|||`**.
2. **Caixa de Enigma Descendente (`.boss-meaning-box`):** Em vez de rúnicos soltos, o jogador enfrenta uma caixa translúcida de vidro fosco que desce suavemente exibindo o significado e a quantidade de letras da palavra secreta contextualizada ao cenário do boss.
3. **Golpes Críticos:** Ao deduzir o significado e digitar corretamente todas as letras da palavra no teclado antes da caixa tocar o fundo, o jogador desfere um impacto devastador que arranca 1 vida do chefão (`|||` $\to$ `||` $\to$ `|` $\to$ Derrota).
4. **Recompensas de Vitória:** Ao zerar os 3 pontos de vida do Guardião, uma chuva de confetes comemora o feito e o jogador escolhe gratuitamente 1 entre 3 habilidades ou itens especiais de premiação para fortalecer sua jornada.

## 4. Sistema de Habilidades

As habilidades podem ser acumuladas na stack do HUD (`×1`, `×2`...) e ativadas a qualquer momento de duas formas intuitivas:
- **Atalhos Numéricos:** Pressionando as teclas numéricas <kbd>1</kbd> a <kbd>8</kbd> no teclado (suporte a até 8 habilidades ativáveis no inventário).
- **Clique com o Mouse:** Clicando diretamente sobre a pílula da habilidade no painel lateral de Habilidades.

### Monitoramento de Duração Ativa no HUD
Ao ser acionada, a habilidade **não é removida de imediato** da lista:
- O card recebe o status luminoso **`ATIVO`** e passa a exibir a contagem regressiva em segundos em tempo real.
- Uma **barra de progresso luminosa** (`.sp-active-bar`) na base do card retrai suavemente a 60fps acompanhando a duração restante.
- A pílula é removida da stack apenas quando o tempo expira ou caso o efeito seja cancelado prematuramente (ex.: término antecipado do Freezer por limpeza total da tela).

| Ícone | Habilidade | Tecla | Duração | Descrição do Efeito |
|:---:|:---|:---:|:---:|:---|
| ❄️ | **Freezer** | <kbd>1</kbd>–<kbd>8</kbd> | 10s | Congela todos os rúnicos na tela impedindo sua descida. **Auto-cancelamento inteligente:** se o jogador limpar todos os rúnicos antes dos 10s, o gelo desativa automaticamente. |
| 💣 | **Bomb** | <kbd>1</kbd>–<kbd>8</kbd> | 10s | Durante 10 segundos, cada letra, sílaba ou palavra completada gera uma **onda de choque em área** que destrói todos os rúnicos próximos e absorve seus pontos (quanto maior a palavra, maior o raio de explosão: 5 letras = 5 linhas, 10 letras = 10 linhas!). |
| 🛡️ | **Imunidade** | <kbd>1</kbd>–<kbd>8</kbd> | 10s | Cria uma barreira de energia rúnica: rúnicos que caem **não tiram vidas**, e erros cometidos no teclado **não descontam pontos nem quebram o combo**. |
| 🌀 | **Vórtice** | <kbd>1</kbd>–<kbd>8</kbd> | 10s | A cada **2 segundos**, o Vórtice consome automaticamente 1 rúnico em queda na esteira concedendo seus pontos integrais. **Proteção de foco:** nunca consome o que o jogador já começou a digitar. |
| ⏱️ | **Slowdown** | <kbd>1</kbd>–<kbd>8</kbd> | 15s | Reduz a velocidade de descida de todos os rúnicos pela metade (50%) com anel atmosférico azul ao redor da tela. |
| ⚡ | **Haste** | <kbd>1</kbd>–<kbd>8</kbd> | 15s | Aumenta a velocidade para **1.7×** mas **dobra todos os pontos recebidos (2×)** enquanto estiver ativo. |
| 🔒 | **Trava Velocidade** | <kbd>1</kbd>–<kbd>8</kbd> | 60s | Mantém o multiplicador de velocidade travado em **1.0×** por 60 segundos, impedindo acelerações causadas por erros de digitação. |
| 🌌 | **Espaçamento** | <kbd>1</kbd>–<kbd>8</kbd> | 45s | Aumenta o espaçamento vertical e o intervalo de tempo entre novos rúnicos gerados por 45 segundos, permitindo digitação mais ritmada e confortável. |

---

## 5. Loja de Habilidades e Economia

A **primeira Loja de Habilidades** se abre após a **fase 5** ser concluída, e em seguida **a cada 3 fases** (fases 5, 8, 11, 14...):
- **Moeda de Compra:** Pontos Totais bancados (`totalScore`).
- **Oferta Rotativa:** 3 itens sorteados aleatoriamente a cada abertura.
- **Inflação Exponencial:** A cada compra realizada, o preço de todos os itens subsequentes aumenta exponencialmente:
  $$\text{Preço Final} = \lceil \text{Preço Base} \times 1.45^{\text{Compras Realizadas}} \rceil$$

### Itens e Habilidades Disponíveis na Loja

#### 1. Habilidades Arcanas Ativáveis (8 Habilidades — Ocupam Slots 1–8 no HUD)
- ❄️ **Freezer (300 pts / 10s):** Congela a esteira inteira impedindo a descida.
- 💣 **Bomb (450 pts / 10s):** Explosão em área com escala por tamanho do vocábulo digitado.
- 🛡️ **Imunidade (390 pts / 10s):** Escudo protetor contra danos e erros de digitação.
- 🌀 **Vórtice (420 pts / 10s):** Consome 1 rúnico urgente a cada 2s concedendo seus pontos.
- ⏱️ **Slowdown (240 pts / 15s):** Desaceleração de 50% na esteira com aura azul.
- ⚡ **Haste (240 pts / 15s):** Pontos em dobro (2×) com velocidade 1.7×.
- 🔒 **Trava Velocidade (540 pts / 60s):** Trava a esteira em 1.0× por 1 minuto.
- 🌌 **Espaçamento (480 pts / 45s):** Amplia a distância vertical e intervalo entre vocábulos por 45s.

#### 2. Itens de Consumo Imediato e Uso Especial (3 Itens — Não Ocupam Slots de Habilidade)
- 🪙 **Ficha Continue (900 pts):** Não é acionável durante a fase. Ao sofrer Game Over (perda de todas as vidas), permite reviver imediatamente na mesma fase mantendo pontuação e progresso acumulados.
- 📦 **Pacote Misterioso (330 pts):** Consumível imediato de catálogo. Ao comprar, é consumido no mesmo instante, sorteando e desbloqueando instantaneamente 3 palavras secretas para o acervo da Biblioteca.
- ❤️ **+1 Vida (600 pts):** Adiciona imediatamente +1 vida permanente para a reserva da partida atual (elevando o limite máximo até o teto de 6 vidas). Não se acumula em slots numéricos.

---

## 6. Biblioteca de Palavras (Bestiário)

A **Biblioteca** funciona como um acervo e bestiário de todas as 30 palavras do jogo:
- **Descoberta:** As palavras são desbloqueadas ao passar de fases ou através do **Pacote Misterioso** na loja.
- **Status:**
  - Palavras Bloqueadas aparecem como `🔒 ???` com a categoria visível.
  - Palavras Descobertas mostram a categoria, o valor em pontos e o contador de digitações concluídas (`✓ digitada N×`).
- **Acesso Universal:** Pode ser aberta na Tela Inicial, durante a partida pelo botão no topo do HUD, no menu de pausa (<kbd>ESC</kbd>) ou na tela de Game Over.
- **Pausa Automática:** Abrir a Biblioteca durante a partida **pausa o jogo automaticamente** e retoma suavemente ao clicar em "Voltar ao Jogo".

---

## 7. Design, UI e Experiência do Jogador

### 7.1 Vidro Fosco Autêntico (Frosted Glassmorphism Moderno)
O ecossistema visual de Digitinho adota uma linguagem aeroespacial translúcida, limpa e vibrante em todas as suas telas:
- **Translucidez Calibrada (36%–46%):** Superfícies de vidro (`backdrop-filter: blur(28px) saturate(210%)`) presentes no HUD, na área central, no menu de pausa (`.pause-box`), nos modais (`.modal-box`), na tela inicial (`.start-wrap`) e no Game Over (`.gameover-card`), refratando com elegância as malhas coloridas e curvas topográficas do fundo.
- **Plano de Fundo Dinâmico (Ambient Orbs):** Mesh gradients orgânicos multicor (Ciano, Esmeralda, Violeta, Coral, Âmbar, Magenta) e curvas de nível topográficas em canvas contínuo a 60fps, permanecendo visíveis mesmo durante telas de pausa e diálogo graças a backdrops suaves (`28%–32%`).
- **Design Clean 100% Sem Bordas & Sem Sombras Pesadas nas Caixas:**
  - Eliminação de halos escuros e sombras pesadas em volta das caixas flutuantes (`box-shadow: none`).
  - Remoção de linhas claras artificiais no topo (`inset 0 1px 0`).
  - Caixas centrais de modais e diálogos totalmente **sem bordas** (`border: none`).
- **Cards Internos Foscos (Frosted Matte Glass):** Todos os cards e itens contidos no interior dos modais e painéis (`.training-world-card`, `.settings-opt-card`, `.pause-opt-card`, `.shop-card`, `.achievement-card`, `.boss-skill-card`, `.lib-word-card`, `.go-bento-card`, `.side-card`, `.rules-card`) utilizam acabamento fosco aeroespacial:
  - Fundo fosco com opacidade reforçada (`var(--glass-card)`: 74% dark / 82% light) e desfoque individual (`backdrop-filter: var(--glass-card-blur)` com blur de 14px), impedindo que botões ou malhas do fundo vazem para o interior dos cards.
  - Borda refinada de vidro (`var(--glass-card-border)`: 1px translúcido).
  - Hover suave (`var(--glass-card-hover)`) com elevação tátil.
  - Sub-elementos e badges internos com camada de contraste (`var(--glass-sub-card)`).

### 7.1 Menu Principal (Tela Inicial)
A tela de início (`#screen-start`) concentra as opções e diretrizes essenciais em um cartão flutuante de vidro fosco:
- **Alinhamento Vertical dos Modos e Ações:**
  - `🎮 Começar`: Inicia o modo clássico com progressão de fases e 3 vidas.
  - `🎓 Modo Treinamento (Linhas do Teclado)`: Trilhas pedagógicas dos 4 Mundos (Linha Base, Superior, Inferior e Acentos) com 3 lições estruturadas e selos de maestria.
  - `🧘 Modo Zen (Sem Vidas)`: Sessão contínua sem game over, ideal para relaxamento e treino.
  - `⚡ Contra o Tempo (60s)`: Corrida rápida de 60 segundos com pontuação acumulada.
  - `📖 Biblioteca`: Acesso direto ao bestiário de palavras já desbloqueadas.
  - `🏆 Conquistas`: Modal de insígnias e marcos alcançados.
  - `⚙️ Configurações`: Abre diretamente o painel de ajustes (áudio/som, posição da fila de rúnicos e tema claro/escuro).
- **Instruções de Jogo Curadas e Objetivas:**
  - ⌨️ **Como Jogar:** Digite diretamente as letras, sílabas e palavras no teclado antes de caírem.
  - 💥 **Palavras Coringa:** Destroem todos os rúnicos na tela simultaneamente e somam todos os seus pontos.
  - 🔢 **Teclas 1–4 (ou clique):** Ativam habilidades arcanas adquiridas para congelar, explodir ou proteger.
  - ⚡ **Combos & Modo Fúria:** Sequências de acertos consecutivos sem erros multiplicam a pontuação em até 8×.
  - ❤️ **Vidas & Perigo:** Rúnicos próximos do fundo entram em alerta pulsante vermelho e custam 1 vida ao cair.

### 7.2 Painel de Desempenho Unificado (Sidebar Esquerda)
Todas as métricas de performance ficam consolidadas em um card único e elegante:
- **PTS FASE:** Pontos acumulados na rodada atual.
- **PTS TOTAL:** Saldo acumulado bancado formatado em 10 dígitos (`0000000000`).
- **ACERTOS:** Letras/rúnicos corretos digitados (verde).
- **ERROS:** Erros cometidos (vermelho).
- **VELOCIDADE:** Multiplicador dinâmico em badge dourado (`1.0×`).
- **Métricas Avançadas:** Velocidade de digitação em PPM (WPM) e Taxa de Precisão em tempo real.

### 7.3 Coluna Central e Fila (`PRÓXIMOS`)
- Coluna vertical de 440px com superfícies de vidro fosco.
- **Fila de Próximos com Feedback Gradual de Proximidade:** Exibe os próximos 6 rúnicos da esteira com opacidade gradativa (100% no 1º item até 18% no 6º item), fornecendo sensação tátil imediata da ordem de queda.
- **Proteção Geométrica das Letras:** Aplicação de `flex-shrink: 0`, `min-width: 28px` e `aspect-ratio: 1/1`, garantindo círculos perfeitamente redondos sem achatamento mesmo diante de palavras extensas.
- **Posição Configurável:** Posicionada no **TOPO** por padrão, com alternância em 1 clique para a **BASE** (no próprio card da fila durante o jogo ou na janela de Configurações), com persistência no `localStorage`.
- Rúnicos surgem no tabuleiro **completamente visíveis desde o primeiro instante**, com detecção de queda e aura de escudo alinhadas automaticamente.

### 7.4 Contagem Regressiva Pós-Pause Clean
Ao despausar o jogo:
- A tela executa uma contagem regressiva "3, 2, 1, VAI!" com áudio progressivo.
- **Design Clean de Vidro e Blur:** A caixa central segue à risca a identidade visual do projeto:
  - Vidro translúcido aeroespacial (`var(--glass-surface)` com `backdrop-filter: blur(24px) saturate(200%)`).
  - Totalmente **sem bordas** (`border: none`) e com poucos detalhes decorativos.
  - **Zero sombra ou blur pesados em volta** (`box-shadow: none`), eliminando o aspecto de bloco escuro e halos opacos.
  - **Tipografia nítida e direta:** Remoção do brilho/text-shadow neon exagerado do número, exibindo caracteres brancos sólidos e legíveis.
- O overlay do tabuleiro mantém desfoque ultraleve de 2px, garantindo que o jogador visualize perfeitamente a posição de todos os rúnicos em tela e possa planejar suas digitações antes de a física de queda reiniciar.

### 7.5 Menu de Pausa & Painel de Configurações (Fórmula de Fundo Visível)
Ao pausar a partida (<kbd>ESC</kbd>), a tela aplica a regra padrão de design translúcido (`.agents/rules/translucent-overlays.md`):
- **Backdrop com Desfoque Ultraleve (2px):** O overlay utiliza `var(--overlay-backdrop)` com `backdrop-filter: blur(2px)`, garantindo que o jogador continue enxergando perfeitamente a posição de cada rúnico na coluna e as cores do cenário por trás do menu.
- **Caixa em Vidro Aeroespacial:** A `.pause-box` adota `var(--overlay-box-bg)` com `backdrop-filter: blur(24px) saturate(200%)`, sem bordas (`border: none`) e sem sombras pesadas (`box-shadow: none`), exatamente como na contagem regressiva.
- **Ações Principais (com Ícones SVG Vetoriais Modernos):**
  - `Continuar`: Retoma o jogo com a contagem "3, 2, 1, VAI!".
  - `Biblioteca`: Acesso ao bestiário de palavras descobertas.
  - `Conquistas`: Visualização de conquistas e progresso.
  - `Configurações`: Abre a tela de ajustes categorizados.
  - `Voltar ao Menu de Treino` (Exclusivo do Modo Treino): Retorna diretamente ao seletor de lições e mundos de treino.
  - `Voltar pro Menu Principal`: Exibe confirmação in-game segura antes de retornar à tela inicial.
- **Painel de Configurações Dedicado:**
  - **Efeitos Sonoros (SFX):** Alterna o áudio do jogo entre `🔊 Ligado` e `🔇 Mudo`, com corte imediato da síntese sonora e persistência no `localStorage`.
  - **Posição da Fila:** Alterna entre `⬆️ Topo (Padrão)` e `⬇️ Base`.
  - **Tema Visual:** Alterna entre os temas `🌙 Escuro` e `☀️ Claro`.
  - Navegação intuitiva com botão `⬅️ Voltar ao Menu` ou tecla <kbd>ESC</kbd>.

### 7.6 Tela de Game Over (Arcade Moderno)
- **Fundo Imersivo:** Efeito de desfoque profundo (`backdrop-filter: blur(20px)`) sobre a mesa de jogo com iluminação vinheta carmesim.
- **Emblema Neon:** Caveira pulsante com brilho volumétrico (`💀`).
- **Bento Grid de 5 Estatísticas:**
  1. 🏆 **Pontos Totais** (Card de destaque ampliado com iluminação indigo)
  2. 🚩 **Fase Máxima Alcançada**
  3. 🎯 **Total de Acertos**
  4. ⚠️ **Total de Erros**
  5. 📖 **Palavras Descobertas na Biblioteca** (`X / 30`)
- **Ações:** Botões com ícones vetoriais modernos para `Jogar Novamente`, `Biblioteca` e `Conquistas`.

---

## 8. Controles e Atalhos de Teclado

| Tecla / Ação | Função |
|:---:|:---|
| <kbd>A</kbd> – <kbd>Z</kbd> | Digitação direta dos rúnicos em queda (sem necessidade de campo de input visível) |
| <kbd>Backspace</kbd> | Limpa o buffer de digitação atual e cancela a mira |
| <kbd>ESC</kbd> | Pausa ou retoma o jogo imediatamente |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> | Ativa a habilidade arcana do respectivo Slot 1 a 4 |
| **Clique do Mouse** | Clica diretamente no card de qualquer habilidade na lista lateral para ativá-la |

---

## 9. Como Executar

O projeto é completamente estático e autônomo, não necessitando de `npm`, compilações ou bundlers.

### Opção 1: Diretamente no Navegador
Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge, Safari):
```bash
# Exemplo no Linux:
google-chrome index.html
# Ou no Firefox:
firefox index.html
```

### Opção 2: Via Servidor Web Local (Apache / PHP / Live Server)
Caso utilize LAMPP/XAMPP:
```
http://localhost/digitinho/
```
Ou utilizando o servidor embutido do Python na pasta do projeto:
```bash
python3 -m http.server 8000
# Acesse no navegador: http://localhost:8000
```
