export const cardContent = {
  reflexao: [
    "Qual foi a última vez que você mudou de opinião sobre algo importante?",
    "O que você diria para o seu 'eu' de 5 anos atrás?",
    "Como você define sucesso hoje em dia?",
    "Qual hábito você gostaria de transformar em virtude?",
    "O que o silêncio te ensina quando você realmente para para ouvir?",
    "Se você pudesse herdar uma qualidade de alguém aqui, qual seria?",
    "Qual medo você já superou e que hoje te dá orgulho?",
    "O que significa 'estar presente' para você neste exato momento?"
  ],
  desafio: [
    "Fale uma qualidade genuína de cada jogador presente.",
    "Conte uma história curta e engraçada sobre você.",
    "Respire fundo 3 vezes e descreva uma sensação física atual.",
    "Tente adivinhar o maior sonho do jogador à sua direita.",
    "Faça um elogio para a pessoa que está há mais tempo sem jogar.",
    "Diga algo que você aprecia na dinâmica deste grupo.",
    "Seja o 'espelho' do próximo jogador por uma rodada (imite seus gestos).",
    "Compartilhe uma música que define seu estado de espírito hoje."
  ],
  sorte: [
    "Sua mente está clara e focada. Avance 3 casas.",
    "Um momento de distração necessário. Volte 2 casas.",
    "Sincronicidade! Escolha um jogador para avançar 2 casas com você.",
    "Intuição aguçada. Jogue o dado novamente.",
    "Pausa revigorante. Fique uma rodada sem jogar e ganhe um 'insight'.",
    "Caminho aberto. Vá direto para a próxima casa de Reflexão.",
    "Troca de perspectivas. Troque de lugar com qualquer jogador.",
    "Energia renovada! Avance até a posição do jogador líder."
  ],
  memoria: [
    "Tente se lembrar do nome de três casas que você já passou.",
    "Qual foi o último número que você tirou no dado?",
    "Lembre-se de um detalhe da roupa do jogador à sua esquerda.",
    "Repita a instrução da última carta de Reflexão que foi lida.",
    "Quais são as cores de todos os jogadores nesta mesa?",
    "Lembre-se de uma palavra-chave dita no início da partida.",
    "Descreva a imagem central do tabuleiro sem olhar para ele.",
    "Quem foi o primeiro jogador a mover seu peão?"
  ],
  experiencia: [
    "Conte sobre um aprendizado recente fora deste jogo.",
    "Como você se sente quando erra algo novo?",
    "Compartilhe uma experiência onde você teve que ter paciência.",
    "O que te motiva a continuar tentando quando um desafio é difícil?",
    "Descreva um momento em que você ensinou algo para alguém.",
    "Qual ferramenta você mais usa para aprender coisas novas?",
    "Como você organiza seu espaço de estudo ou trabalho?",
    "Se você pudesse aprender qualquer habilidade agora, qual seria?"
  ]
};

export const getRandomCardContent = (type, customContent = null) => {
  const contentList = (customContent && customContent[type]) || cardContent[type] || cardContent.reflexao;
  if (!contentList || contentList.length === 0) return "Nenhum conteúdo disponível.";
  return contentList[Math.floor(Math.random() * contentList.length)];
};
