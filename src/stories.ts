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
  {
    id: 'onibus', title: 'Vou andar de ônibus', category: 'Transporte',
    scenes: [
      { illustration: 'note', title: 'Planejo o caminho', text: 'Posso conferir o número do ônibus, onde vou subir e em qual ponto vou descer.' },
      { illustration: 'pause', title: 'Espero no ponto', text: 'O horário pode mudar. Se eu ficar em dúvida, posso conferir de novo ou pedir ajuda a alguém.' },
      { illustration: 'sound', title: 'Durante a viagem', text: 'O ônibus pode fazer barulho e balançar. Posso me sentar ou segurar numa barra, se estiver de pé.' },
      { illustration: 'door', title: 'Chego ao meu ponto', text: 'Quando meu ponto estiver perto, posso apertar o botão de parada. Espero o ônibus parar antes de descer.' },
    ],
  },
  {
    id: 'mercado', title: 'Vou ao supermercado', category: 'Dia a dia',
    scenes: [
      { illustration: 'note', title: 'Faço uma lista', text: 'Posso anotar o que preciso comprar. Uma lista curta pode me ajudar a lembrar o que procurar.' },
      { illustration: 'sound', title: 'Entro no mercado', text: 'O mercado pode ter luzes fortes, música ou muita gente. Posso usar um recurso que me ajuda, como protetores de ouvido.' },
      { illustration: 'pause', title: 'Escolho o que fazer', text: 'Se não encontrar um produto, posso perguntar onde fica, escolher outro ou deixar para depois.' },
      { illustration: 'done', title: 'Pago e saio', text: 'No caixa, posso ter de esperar minha vez. Depois de pagar, confiro se estou levando minhas compras.' },
    ],
  },
  {
    id: 'mudanca', title: 'Meu plano mudou', category: 'Bem-estar',
    scenes: [
      { illustration: 'calendar', title: 'Recebo uma notícia', text: 'Às vezes, algo que eu esperava muda ou é cancelado. Posso ficar frustrado, confuso ou precisar de tempo.' },
      { illustration: 'note', title: 'Pergunto sobre a mudança', text: 'Posso perguntar o que mudou e o que vai acontecer agora. Posso pedir que me expliquem por escrito.' },
      { illustration: 'pause', title: 'Escolho como seguir', text: 'Posso fazer uma pausa, montar um plano novo ou pedir ajuda. Também posso dizer se ainda não estou pronto para decidir.' },
    ],
  },
  {
    id: 'trabalho-ajuda', title: 'Preciso de ajuda no trabalho', category: 'Trabalho',
    scenes: [
      { illustration: 'note', title: 'Identifico a dúvida', text: 'Posso anotar o que já entendi e qual parte da tarefa preciso esclarecer.' },
      { illustration: 'door', title: 'Escolho a quem perguntar', text: 'Posso falar com quem passou a tarefa ou com uma pessoa da equipe. Se for mais fácil, posso mandar uma mensagem.' },
      { illustration: 'done', title: 'Confirmo o próximo passo', text: 'Posso pedir um exemplo e confirmar o que devo fazer primeiro. Se surgir outra dúvida, posso perguntar de novo.' },
    ],
  },
  {
    id: 'barulho', title: 'O lugar está barulhento', category: 'Bem-estar',
    scenes: [
      { illustration: 'sound', title: 'Percebo o barulho', text: 'Um som pode me incomodar mesmo quando outras pessoas parecem confortáveis. Posso prestar atenção a como meu corpo responde.' },
      { illustration: 'pause', title: 'Uso o que me ajuda', text: 'Posso colocar protetores de ouvido, pedir que baixem o volume ou me afastar do som, se for possível.' },
      { illustration: 'door', title: 'Decido se quero voltar', text: 'Posso continuar em um lugar mais tranquilo. Se eu quiser voltar, posso fazer isso no meu ritmo.' },
    ],
  },
  {
    id: 'festa', title: 'Vou a uma festa', category: 'Convivência',
    scenes: [
      { illustration: 'calendar', title: 'Antes de ir', text: 'Posso perguntar onde é a festa, quem vai estar lá e como posso ir embora quando quiser.' },
      { illustration: 'door', title: 'Quando chego', text: 'Posso cumprimentar com palavras ou com um gesto. Se quiser, posso ficar perto de alguém que conheço.' },
      { illustration: 'pause', title: 'Se eu quiser descansar', text: 'Posso procurar um lugar mais tranquilo ou pedir ajuda para sair um pouco. Também posso escolher ir embora mais cedo.' },
      { illustration: 'done', title: 'Na hora de sair', text: 'Posso me despedir pessoalmente ou mandar uma mensagem depois. Posso escolher o que funciona para mim.' },
    ],
  },
];
