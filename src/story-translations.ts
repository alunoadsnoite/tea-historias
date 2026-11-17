import type { Language } from './i18n.ts';

type StoryCopy = {
  title: string;
  scenes: [title: string, text: string][];
};

const translations: Record<Exclude<Language, 'pt'>, Record<string, StoryCopy>> = {
  en: {
    dentista: {
      title: 'I’m going to the dentist',
      scenes: [
        ['Before the appointment', 'I have a dental appointment. I can ask where the dental office is and what might happen there.'],
        ['I arrive at the dental office', 'I can wait until my name is called. If it’s too noisy, I can ask if there’s a quieter place to wait.'],
        ['In the chair', 'The chair might tilt back, and a light might be close to my face. I can ask the dentist to explain each step before starting.'],
        ['If I need a break', 'I can agree on a signal with the dentist, such as raising my hand. That way I can ask for a break even when my mouth is open.'],
        ['The appointment ends', 'When the appointment is over, I can ask questions about what I heard. If there are instructions, I can ask for them in writing.'],
      ],
    },
    pausa: {
      title: 'I can ask for a break',
      scenes: [
        ['I notice how I feel', 'Sometimes lights, sounds, or many things happening at once make me tired. I might want some time to rest.'],
        ['I ask for a break', 'I can say, “I need a break.” I can also show a message on my phone or use a signal we agreed on.'],
        ['I look for a quiet place', 'If I can step out, I can go somewhere quieter. I can ask for help finding a place if I need it.'],
        ['I decide what I need now', 'I can go back when I’m ready. If I still need time or help, I can let someone know.'],
      ],
    },
    entrevista: {
      title: 'I’m going to a job interview',
      scenes: [
        ['I confirm the details', 'I can check the time, place, and who I’ll be talking to. I can also ask what the interview will be like.'],
        ['I prepare a few examples', 'I can write down examples of things I’ve done. They can help me talk about how I work and what I know how to do.'],
        ['I arrive for the interview', 'I can give my name and say I have an interview scheduled. I might need to wait a little while.'],
        ['I have time to think', 'If I don’t understand a question, I can ask the interviewer to repeat it. I can also say, “I need a moment to think.”'],
        ['I wrap up the conversation', 'I can ask my questions and find out what happens next. Afterward, I can write down what we agreed on.'],
      ],
    },
    onibus: {
      title: 'I’m taking the bus',
      scenes: [
        ['I plan my route', 'I can check the bus number, where I’ll get on, and which stop I’ll get off at.'],
        ['I wait at the stop', 'The schedule might change. If I’m unsure, I can check again or ask someone for help.'],
        ['During the ride', 'The bus might be noisy or bumpy. I can sit down or hold on to a rail if I’m standing.'],
        ['I reach my stop', 'When my stop is close, I can press the stop button. I wait for the bus to stop before getting off.'],
      ],
    },
    mercado: {
      title: 'I’m going to the supermarket',
      scenes: [
        ['I make a list', 'I can write down what I need to buy. A short list can help me remember what to look for.'],
        ['I go into the supermarket', 'There might be bright lights, music, or a lot of people. I can use something that helps me, such as ear defenders.'],
        ['I decide what to do', 'If I can’t find something, I can ask where it is, choose something else, or leave it for later.'],
        ['I pay and leave', 'I might have to wait my turn at the checkout. After paying, I check that I have my shopping with me.'],
      ],
    },
    mudanca: {
      title: 'My plan changed',
      scenes: [
        ['I hear the news', 'Sometimes something I was expecting changes or gets canceled. I might feel frustrated or confused, or I might need some time.'],
        ['I ask about the change', 'I can ask what changed and what will happen now. I can ask for an explanation in writing.'],
        ['I choose what to do next', 'I can take a break, make a new plan, or ask for help. I can also say that I’m not ready to decide yet.'],
      ],
    },
    'trabalho-ajuda': {
      title: 'I need help at work',
      scenes: [
        ['I identify my question', 'I can write down what I already understand and which part of the task I need help with.'],
        ['I choose who to ask', 'I can speak to the person who gave me the task or someone on the team. If it’s easier, I can send a message.'],
        ['I confirm the next step', 'I can ask for an example and check what to do first. If another question comes up, I can ask again.'],
      ],
    },
    barulho: {
      title: 'It’s noisy here',
      scenes: [
        ['I notice the noise', 'A sound can bother me even if other people seem comfortable. I can pay attention to how my body responds.'],
        ['I use what helps me', 'I can put on ear defenders, ask for the volume to be turned down, or move away from the sound if I can.'],
        ['I decide whether to go back', 'I can stay somewhere quieter. If I want to go back, I can do it at my own pace.'],
      ],
    },
    festa: {
      title: 'I’m going to a party',
      scenes: [
        ['Before I go', 'I can ask where the party is, who will be there, and how I can get home when I want to leave.'],
        ['When I arrive', 'I can say hello with words or a gesture. If I want to, I can stay near someone I know.'],
        ['If I want to rest', 'I can look for somewhere quiet or ask for help stepping out for a while. I can also choose to leave early.'],
        ['When it’s time to go', 'I can say goodbye in person or send a message later. I can choose what works for me.'],
      ],
    },
  },
  es: {
    dentista: {
      title: 'Voy al dentista',
      scenes: [
        ['Antes de la consulta', 'Tengo una cita con la dentista. Puedo preguntar dónde está la consulta y qué podría pasar allí.'],
        ['Llego a la consulta', 'Puedo esperar hasta que me llamen por mi nombre. Si hay mucho ruido, puedo preguntar si hay un lugar más tranquilo para esperar.'],
        ['En el sillón', 'El sillón puede reclinarse y puede haber una luz cerca de mi cara. Puedo pedirle a la dentista que me explique cada paso antes de empezar.'],
        ['Si necesito una pausa', 'Puedo acordar una señal con la dentista, como levantar la mano. Así puedo pedir una pausa aunque tenga la boca abierta.'],
        ['Termina la consulta', 'Cuando termine, puedo hacer preguntas sobre lo que escuché. Si me dan indicaciones, puedo pedir que me las den por escrito.'],
      ],
    },
    pausa: {
      title: 'Puedo pedir una pausa',
      scenes: [
        ['Me doy cuenta de cómo me siento', 'A veces me cansan las luces, los sonidos o que pasen muchas cosas a la vez. Quizá quiera un rato para descansar.'],
        ['Pido una pausa', 'Puedo decir: «Necesito una pausa». También puedo mostrar un mensaje en el celular o usar una señal acordada.'],
        ['Busco un lugar tranquilo', 'Si puedo salir, puedo ir a un lugar más tranquilo. Si necesito ayuda para encontrarlo, puedo pedirla.'],
        ['Decido qué necesito ahora', 'Puedo volver cuando me sienta en condiciones. Si todavía necesito tiempo o ayuda, puedo avisar.'],
      ],
    },
    entrevista: {
      title: 'Voy a una entrevista de trabajo',
      scenes: [
        ['Confirmo los detalles', 'Puedo confirmar la hora, el lugar y con quién voy a hablar. También puedo preguntar cómo será la entrevista.'],
        ['Preparo algunos ejemplos', 'Puedo anotar ejemplos de cosas que ya hice. Me pueden ayudar a explicar cómo trabajo y qué sé hacer.'],
        ['Llego a la entrevista', 'Puedo decir mi nombre y avisar que tengo una entrevista programada. Tal vez tenga que esperar un poco.'],
        ['Tengo tiempo para pensar', 'Si no entiendo una pregunta, puedo pedir que la repitan. También puedo decir: «Necesito un momento para pensar».'],
        ['Termino la conversación', 'Puedo hacer mis preguntas y averiguar cuáles son los siguientes pasos. Después puedo anotar lo que acordamos.'],
      ],
    },
    onibus: {
      title: 'Voy a tomar el autobús',
      scenes: [
        ['Planeo el recorrido', 'Puedo comprobar el número del autobús, dónde voy a subir y en qué parada voy a bajar.'],
        ['Espero en la parada', 'El horario puede cambiar. Si tengo dudas, puedo consultarlo de nuevo o pedir ayuda.'],
        ['Durante el viaje', 'El autobús puede hacer ruido y moverse mucho. Puedo sentarme o sujetarme a una barra si estoy de pie.'],
        ['Llego a mi parada', 'Cuando se acerque mi parada, puedo pulsar el botón para pedir que pare. Espero a que el autobús se detenga antes de bajar.'],
      ],
    },
    mercado: {
      title: 'Voy al supermercado',
      scenes: [
        ['Hago una lista', 'Puedo anotar lo que necesito comprar. Una lista corta me puede ayudar a recordar qué buscar.'],
        ['Entro al supermercado', 'Puede haber luces fuertes, música o mucha gente. Puedo usar algo que me ayude, como protectores auditivos.'],
        ['Elijo qué hacer', 'Si no encuentro un producto, puedo preguntar dónde está, elegir otro o dejarlo para otro día.'],
        ['Pago y salgo', 'En la caja quizá tenga que esperar mi turno. Después de pagar, compruebo que llevo mis compras.'],
      ],
    },
    mudanca: {
      title: 'Mi plan cambió',
      scenes: [
        ['Recibo la noticia', 'A veces algo que esperaba cambia o se cancela. Puedo sentir frustración o confusión, o necesitar algo de tiempo.'],
        ['Pregunto por el cambio', 'Puedo preguntar qué cambió y qué va a pasar ahora. Puedo pedir una explicación por escrito.'],
        ['Elijo cómo seguir', 'Puedo tomarme una pausa, hacer otro plan o pedir ayuda. También puedo decir que todavía necesito tiempo para decidir.'],
      ],
    },
    'trabalho-ajuda': {
      title: 'Necesito ayuda en el trabajo',
      scenes: [
        ['Identifico mi duda', 'Puedo anotar lo que ya entiendo y qué parte de la tarea necesito aclarar.'],
        ['Elijo a quién preguntar', 'Puedo hablar con quien me asignó la tarea o con alguien del equipo. Si me resulta más fácil, puedo enviar un mensaje.'],
        ['Confirmo el siguiente paso', 'Puedo pedir un ejemplo y confirmar qué tengo que hacer primero. Si surge otra duda, puedo volver a preguntar.'],
      ],
    },
    barulho: {
      title: 'Aquí hay mucho ruido',
      scenes: [
        ['Noto el ruido', 'Un sonido me puede molestar aunque otras personas parezcan cómodas. Puedo fijarme en cómo reacciona mi cuerpo.'],
        ['Uso lo que me ayuda', 'Puedo ponerme protectores auditivos, pedir que bajen el volumen o alejarme del sonido si es posible.'],
        ['Decido si quiero volver', 'Puedo quedarme en un lugar más tranquilo. Si quiero volver, puedo hacerlo a mi ritmo.'],
      ],
    },
    festa: {
      title: 'Voy a una fiesta',
      scenes: [
        ['Antes de ir', 'Puedo preguntar dónde es la fiesta, quién va a estar y cómo puedo volver a casa cuando quiera irme.'],
        ['Cuando llego', 'Puedo saludar con palabras o con un gesto. Si quiero, puedo quedarme cerca de alguien que conozca.'],
        ['Si quiero descansar', 'Puedo buscar un lugar más tranquilo o pedir ayuda para salir un rato. También puedo decidir irme antes.'],
        ['Cuando me voy', 'Puedo despedirme en persona o enviar un mensaje después. Puedo elegir lo que mejor me funcione.'],
      ],
    },
  },
  fr: {
    dentista: {
      title: 'Je vais chez le dentiste',
      scenes: [
        ['Avant le rendez-vous', 'J’ai un rendez-vous chez la dentiste. Je peux demander où se trouve le cabinet et comment le rendez-vous pourrait se passer.'],
        ['J’arrive au cabinet', 'Je peux attendre qu’on m’appelle par mon nom. S’il y a trop de bruit, je peux demander s’il y a un endroit plus calme pour attendre.'],
        ['Dans le fauteuil', 'Le fauteuil peut s’incliner et une lampe peut être placée près de mon visage. Je peux demander à la dentiste d’expliquer chaque étape avant de commencer.'],
        ['Si j’ai besoin d’une pause', 'Je peux convenir d’un signal avec la dentiste, par exemple lever la main. Ainsi, je peux demander une pause même si j’ai la bouche ouverte.'],
        ['Le rendez-vous se termine', 'À la fin, je peux poser des questions sur ce que j’ai entendu. S’il y a des consignes, je peux demander qu’on me les donne par écrit.'],
      ],
    },
    pausa: {
      title: 'Je peux demander une pause',
      scenes: [
        ['Je remarque ce que je ressens', 'Parfois, les lumières, les sons ou plusieurs choses à la fois me fatiguent. Je peux avoir besoin d’un moment pour me reposer.'],
        ['Je demande une pause', 'Je peux dire : « J’ai besoin d’une pause. » Je peux aussi montrer un message sur mon téléphone ou utiliser un signal convenu.'],
        ['Je cherche un endroit calme', 'Si je peux sortir, je peux aller dans un endroit plus calme. Je peux demander de l’aide pour en trouver un si nécessaire.'],
        ['Je décide de ce dont j’ai besoin', 'Je peux revenir quand je me sens en mesure de le faire. Si j’ai encore besoin de temps ou d’aide, je peux le dire.'],
      ],
    },
    entrevista: {
      title: 'Je vais à un entretien d’embauche',
      scenes: [
        ['Je confirme les détails', 'Je peux vérifier l’heure, le lieu et le nom de la personne que je vais rencontrer. Je peux aussi demander comment se déroulera l’entretien.'],
        ['Je prépare quelques exemples', 'Je peux noter des exemples de choses que j’ai déjà faites. Ils peuvent m’aider à parler de ma façon de travailler et de ce que je sais faire.'],
        ['J’arrive pour l’entretien', 'Je peux donner mon nom et dire que j’ai un entretien prévu. Je devrai peut-être attendre un peu.'],
        ['J’ai le temps de réfléchir', 'Si je ne comprends pas une question, je peux demander qu’on la répète. Je peux aussi dire : « J’ai besoin d’un moment pour réfléchir. »'],
        ['Je termine la conversation', 'Je peux poser mes questions et demander quelles sont les prochaines étapes. Ensuite, je peux noter ce dont nous avons convenu.'],
      ],
    },
    onibus: {
      title: 'Je prends le bus',
      scenes: [
        ['Je prépare mon trajet', 'Je peux vérifier le numéro du bus, où je vais monter et à quel arrêt je vais descendre.'],
        ['J’attends à l’arrêt', 'L’horaire peut changer. Si j’ai un doute, je peux vérifier de nouveau ou demander de l’aide.'],
        ['Pendant le trajet', 'Le bus peut être bruyant et bouger. Je peux m’asseoir ou me tenir à une barre si je reste debout.'],
        ['J’arrive à mon arrêt', 'Quand mon arrêt approche, je peux appuyer sur le bouton d’arrêt. J’attends que le bus s’arrête avant de descendre.'],
      ],
    },
    mercado: {
      title: 'Je vais au supermarché',
      scenes: [
        ['Je fais une liste', 'Je peux noter ce que je dois acheter. Une petite liste peut m’aider à me souvenir de ce que je cherche.'],
        ['J’entre dans le supermarché', 'Il peut y avoir des lumières fortes, de la musique ou beaucoup de monde. Je peux utiliser quelque chose qui m’aide, comme un casque antibruit.'],
        ['Je choisis quoi faire', 'Si je ne trouve pas un produit, je peux demander où il se trouve, en choisir un autre ou le laisser pour plus tard.'],
        ['Je paie et je sors', 'À la caisse, je devrai peut-être attendre mon tour. Après avoir payé, je vérifie que j’ai bien toutes mes courses.'],
      ],
    },
    mudanca: {
      title: 'Mon programme a changé',
      scenes: [
        ['J’apprends la nouvelle', 'Parfois, quelque chose que j’attendais change ou est annulé. Je peux ressentir de la frustration ou de la confusion, ou avoir besoin de temps.'],
        ['Je pose des questions sur le changement', 'Je peux demander ce qui a changé et ce qui va se passer maintenant. Je peux demander une explication par écrit.'],
        ['Je choisis ce que je fais ensuite', 'Je peux faire une pause, trouver un nouveau plan ou demander de l’aide. Je peux aussi dire que j’ai encore besoin de temps pour décider.'],
      ],
    },
    'trabalho-ajuda': {
      title: 'J’ai besoin d’aide au travail',
      scenes: [
        ['Je précise ma question', 'Je peux noter ce que j’ai déjà compris et quelle partie de la tâche j’ai besoin de clarifier.'],
        ['Je choisis à qui demander', 'Je peux parler à la personne qui m’a confié la tâche ou à quelqu’un de l’équipe. Si c’est plus facile, je peux envoyer un message.'],
        ['Je confirme la prochaine étape', 'Je peux demander un exemple et vérifier ce que je dois faire en premier. Si j’ai une autre question, je peux la poser.'],
      ],
    },
    barulho: {
      title: 'Il y a du bruit ici',
      scenes: [
        ['Je remarque le bruit', 'Un son peut me gêner même si les autres semblent à l’aise. Je peux observer comment mon corps réagit.'],
        ['J’utilise ce qui m’aide', 'Je peux mettre un casque antibruit, demander qu’on baisse le volume ou m’éloigner du bruit si c’est possible.'],
        ['Je décide si je veux revenir', 'Je peux rester dans un endroit plus calme. Si je veux revenir, je peux le faire à mon rythme.'],
      ],
    },
    festa: {
      title: 'Je vais à une fête',
      scenes: [
        ['Avant de partir', 'Je peux demander où se passe la fête, qui sera là et comment je pourrai rentrer quand je voudrai partir.'],
        ['Quand j’arrive', 'Je peux dire bonjour avec des mots ou un geste. Si je veux, je peux rester près de quelqu’un que je connais.'],
        ['Si je veux me reposer', 'Je peux chercher un endroit plus calme ou demander de l’aide pour sortir un moment. Je peux aussi choisir de partir plus tôt.'],
        ['Quand je m’en vais', 'Je peux dire au revoir en personne ou envoyer un message plus tard. Je peux choisir ce qui me convient.'],
      ],
    },
  },
};

export function getStoryTranslation(language: Language, id: string) {
  if (language === 'pt') return undefined;
  const catalog = translations[language];
  return Object.prototype.hasOwnProperty.call(catalog, id) ? catalog[id] : undefined;
}
