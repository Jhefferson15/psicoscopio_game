export const cardContent = {
  reflexao: [
    "Para você, o que significa educação?",
    "Para você, o que significa Aprendizagem?",
    "Para você, o que significa memória?",
    "Qual seu método preferido de estudo e porque?",
    "Se você pudesse retirar da educação um método de ensino qual seria e porque?",
    "Qual sua matéria favorita e porque?"
  ],
  desafio: [
    "Escolha um colega na partida para vendar e ajude ele a colocar o copo com aguá no local que você escolheram."
  ],
  sorte: [],
  memoria: [],
  experiencia: [
    "Rememore sua comida favorita da infância!!",
    "Remore uma vez que você tomou uma bronca e achou um injusto!!",
    "Rememore a sua cor favorita da infância!!",
    "Rememore uma situação em que se machucou na infância e aprendeu com a situação!!"
  ]
};

export const categoryDescriptions = {
  reflexao: "Momento de olhar para dentro. Estas cartas propõem perguntas que convidam você a pensar sobre seus valores, crenças e atitudes diante da vida e do aprendizado.",
  desafio: "Hora de agir! Desafios práticos que estimulam a interação com o grupo, a expressão de sentimentos e a saída da zona de conforto de forma lúdica.",
  sorte: "Sincronicidades do caminho. Representam eventos inesperados que podem acelerar sua jornada ou exigir uma pausa estratégica para recalcular a rota.",
  memoria: "Fortalecendo as conexões. Exercícios rápidos para testar sua atenção e retenção de informações sobre o que está acontecendo aqui e agora na partida.",
  experiencia: "Compartilhando sabedoria. Espaço para contar histórias reais e aprendizados de vida, transformando vivências pessoais em conhecimento coletivo."
};

export const getRandomCardContent = (type, customContent = null) => {
  const contentList = (customContent && customContent[type]) || cardContent[type] || cardContent.reflexao;
  if (!contentList || contentList.length === 0) return "Nenhum conteúdo disponível.";
  return contentList[Math.floor(Math.random() * contentList.length)];
};
