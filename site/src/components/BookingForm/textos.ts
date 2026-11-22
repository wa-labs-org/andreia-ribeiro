/* Microcopy padrão do agendamento (01-principios-e-voz): calmo, preciso, próximo. */
import type { BookingField } from './bookingState';

export interface BookingTextos {
  etapas: readonly [string, string, string, string];
  rotuloEtapas: string;
  contadorEtapa: (n: number, total: number) => string;
  para: string;
  servico: string;
  dia: string;
  evento: string;
  cerimonia: string;
  escolha: string;
  referencias: string;
  referenciasPlaceholder: string;
  referenciasHint: string;
  diaProva: string;
  horario: string;
  contato: string;
  nome: string;
  email: string;
  telefone: string;
  telefonePlaceholder: string;
  continuar: string;
  voltar: string;
  confirmar: string;
  falhaEnvio: string;
  confirmadoTitulo: string;
  confirmadoTexto: string;
  confirmadoPara: string;
  erros: Record<Exclude<BookingField, 'cerimonia' | 'referencias'>, string>;
}

export const TEXTOS_PADRAO: BookingTextos = {
  etapas: ['01 · Peça', '02 · O dia', '03 · Prova', '04 · Contato'],
  rotuloEtapas: 'Etapas do agendamento',
  contadorEtapa: (n, total) => `${n} de ${total}`,
  para: 'Para quem é a peça?',
  servico: 'O que você procura?',
  dia: 'Sobre o grande dia',
  evento: 'Data do evento',
  cerimonia: 'Cerimônia',
  escolha: 'Escolha',
  referencias: 'Referências',
  referenciasPlaceholder: 'Um decote, um tecido, uma foto de família…',
  referenciasHint: 'Pode ser só uma palavra. A gente conversa sobre o resto na prova.',
  diaProva: 'Escolha o dia da prova',
  horario: 'Horário',
  contato: 'Como falamos com você?',
  nome: 'Nome',
  email: 'E-mail',
  telefone: 'WhatsApp',
  telefonePlaceholder: '(00) 00000-0000',
  continuar: 'Continuar',
  voltar: 'Voltar',
  confirmar: 'Confirmar prova',
  falhaEnvio:
    'Não conseguimos enviar agora. Confira a conexão e tente de novo: o que você preencheu continua aqui.',
  confirmadoTitulo: 'Prova agendada.',
  confirmadoTexto:
    'Enviamos a confirmação para o seu e-mail. Se puder, traga os sapatos que pretende usar no dia: a barra começa por eles.',
  confirmadoPara: 'Para:',
  erros: {
    para: 'Escolha uma opção para seguirmos.',
    servico: 'Conte se é uma peça nova ou um ajuste.',
    evento: 'Informe a data, mesmo que aproximada.',
    data: 'Escolha um dos dias disponíveis.',
    hora: 'Escolha um horário.',
    nome: 'Conte como podemos chamar você.',
    email: 'Confira o e-mail: falta o @ ou o domínio.',
    telefone: 'Inclua o DDD para confirmarmos a prova.',
  },
};
