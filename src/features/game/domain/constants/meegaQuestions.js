export const MEEGA_QUESTIONS = [
  {
    category: "Usabilidade",
    subcategories: [
      {
        name: "Estética",
        questions: [
          { id: 1, text: "O design do jogo é atraente (interface, gráficos, tabuleiro, cartas, etc.)." },
          { id: 2, text: "Os textos, cores e fontes combinam e são consistentes." }
        ]
      },
      {
        name: "Aprendizibilidade",
        questions: [
          { id: 3, text: "Eu precisei aprender poucas coisas para poder começar a jogar o jogo." },
          { id: 4, text: "Aprender a jogar este jogo foi fácil para mim." },
          { id: 5, text: "Eu acho que a maioria das pessoas aprenderiam a jogar este jogo rapidamente." }
        ]
      },
      {
        name: "Operabilidade",
        questions: [
          { id: 6, text: "Eu considero que o jogo é fácil de jogar." },
          { id: 7, text: "As regras do jogo são claras e compreensíveis." }
        ]
      },
      {
        name: "Acessibilidade",
        questions: [
          { id: 8, text: "As fontes (tamanho e estilo) utilizadas no jogo são legíveis." },
          { id: 9, text: "As cores utilizadas no jogo são compreensíveis." },
          { id: 10, text: "O jogo permite personalizar a aparência (fonte e/ou cor) conforme a minha necessidade." }
        ]
      },
      {
        name: "Proteção contra erros do usuário",
        questions: [
          { id: 11, text: "O jogo me protege de cometer erros." },
          { id: 12, text: "Quando eu cometo um erro é fácil de me recuperar rapidamente." }
        ]
      }
    ]
  },
  {
    category: "Experiência do Jogador",
    subcategories: [
      {
        name: "Confiança",
        questions: [
          { id: 13, text: "Quando olhei pela primeira vez o jogo, eu tive a impressão de que seria fácil para mim." },
          { id: 14, text: "A organização do conteúdo me ajudou a estar confiante de que eu iria aprender com este jogo." }
        ]
      },
      {
        name: "Desafio",
        questions: [
          { id: 15, text: "Este jogo é adequadamente desafiador para mim." },
          { id: 16, text: "O jogo oferece novos desafios (oferece novos obstáculos, situações ou variações) com um ritmo adequado." },
          { id: 17, text: "O jogo não se torna monótono nas suas tarefas (repetitivo ou com tarefas chatas)." }
        ]
      },
      {
        name: "Satisfação",
        questions: [
          { id: 18, text: "Completar as tarefas do jogo me deu um sentimento de realização." },
          { id: 19, text: "É devido ao meu esforço pessoal que eu consigo avançar no jogo." },
          { id: 20, text: "Me sinto satisfeito com as coisas que aprendi no jogo." },
          { id: 21, text: "Eu recomendaria este jogo para meus colegas." }
        ]
      },
      {
        name: "Interação social",
        questions: [
          { id: 22, text: "Eu pude interagir com outras pessoas durante o jogo." },
          { id: 23, text: "O jogo promove momentos de cooperação e/ou competição entre os jogadores." },
          { id: 24, text: "Eu me senti bem interagindo com outras pessoas durante o jogo." }
        ]
      },
      {
        name: "Diversão",
        questions: [
          { id: 25, text: "Eu me diverti com o jogo." },
          { id: 26, text: "Aconteceu alguma situação durante o jogo (elementos do jogo, competição, etc.) que me fez sorrir." }
        ]
      },
      {
        name: "Atenção focada",
        questions: [
          { id: 27, text: "Houve algo interessante no início do jogo que capturou minha atenção." },
          { id: 28, text: "Eu estava tão envolvido no jogo que eu perdi a noção do tempo." },
          { id: 29, text: "Eu esqueci sobre o ambiente ao meu redor enquanto jogava este jogo." }
        ]
      },
      {
        name: "Relevância",
        questions: [
          { id: 30, text: "O conteúdo do jogo é relevante para os meus interesses." },
          { id: 31, text: "É claro para mim como o conteúdo do jogo está relacionado com a disciplina." },
          { id: 32, text: "O jogo é um método de ensino adequado para esta disciplina." },
          { id: 33, text: "Eu prefiro aprender com este jogo do que de outra forma (outro método de ensino)." }
        ]
      },
      {
        name: "Aprendizagem percebida",
        questions: [
          { id: 34, text: "O jogo contribuiu para a minha aprendizagem e compreensão dos conteúdos da psicologia propostos pelo Psicoscópio." },
          { id: 35, text: "O jogo foi eficiente para minha aprendizagem em relação às teorias psicológicas, em comparação com outras atividades." }
        ]
      }
    ]
  }
];

export const LIKERT_SCALE = [
  { value: 1, label: "Discordo Totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo Totalmente" }
];
