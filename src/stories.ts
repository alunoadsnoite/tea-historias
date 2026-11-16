export type Story = {
  id: string;
  title: string;
  category: string;
  scenes: { illustration: string; title: string; text: string }[];
};

export const stories: Story[] = [
  {
    id: 'dentista',
    title: 'Vou ao dentista',
    category: 'Saúde',
    scenes: [
      { illustration: 'calendar', title: 'Antes da consulta', text: 'Tenho uma consulta com a dentista. Posso perguntar onde fica o consultório e o que pode acontecer lá.' },
      { illustration: 'door', title: 'Chego ao consultório', text: 'Posso esperar até chamarem meu nome. Se houver muito barulho, posso perguntar se há um lugar mais tranquilo para esperar.' },
      { illustration: 'chair', title: 'Na cadeira', text: 'A cadeira pode se inclinar e uma luz pode ficar perto do meu rosto. Posso pedir que a dentista explique cada passo antes de começar.' },
      { illustration: 'pause', title: 'Se eu precisar de uma pausa', text: 'Posso combinar um sinal com a dentista, como levantar a mão. Assim, consigo pedir uma pausa mesmo quando minha boca estiver aberta.' },
      { illustration: 'done', title: 'A consulta termina', text: 'Quando terminar, posso fazer perguntas sobre o que ouvi. Se houver orientações, posso pedir que sejam anotadas.' },
    ],
  },
  {
    id: 'pausa',
    title: 'Posso pedir uma pausa',
    category: 'Bem-estar',
    scenes: [
      { illustration: 'sound', title: 'Percebo o que estou sentindo', text: 'Às vezes, luzes, sons ou muitas coisas ao mesmo tempo me cansam. Posso querer um tempo para descansar.' },
      { illustration: 'pause', title: 'Peço uma pausa', text: 'Posso dizer “Preciso de uma pausa”. Também posso mostrar uma mensagem no celular ou usar um sinal combinado.' },
      { illustration: 'chair', title: 'Procuro um lugar tranquilo', text: 'Se eu puder sair, posso ir para um lugar mais tranquilo. Se precisar de ajuda para encontrar um lugar, posso pedir.' },
      { illustration: 'done', title: 'Decido o que preciso agora', text: 'Posso voltar quando estiver pronto. Se ainda precisar de tempo ou ajuda, posso avisar.' },
    ],
  },
  {
    id: 'entrevista',
    title: 'Vou a uma entrevista de emprego',
    category: 'Trabalho',
    scenes: [
      { illustration: 'calendar', title: 'Combino os detalhes', text: 'Posso confirmar o horário, o local e com quem vou falar. Também posso perguntar como será a entrevista.' },
      { illustration: 'note', title: 'Preparo alguns exemplos', text: 'Posso anotar exemplos de coisas que já fiz. Eles podem me ajudar a falar sobre como trabalho e o que sei fazer.' },
      { illustration: 'door', title: 'Chego para a entrevista', text: 'Posso dizer meu nome e avisar que tenho uma entrevista marcada. Talvez eu precise esperar um pouco.' },
      { illustration: 'pause', title: 'Tenho tempo para pensar', text: 'Se eu não entender uma pergunta, posso pedir que a repitam. Também posso dizer “Preciso de um momento para pensar”.' },
      { illustration: 'done', title: 'Encerro a conversa', text: 'Posso fazer minhas perguntas e perguntar quais são os próximos passos. Depois, posso anotar o que combinei.' },
    ],
  },
];
