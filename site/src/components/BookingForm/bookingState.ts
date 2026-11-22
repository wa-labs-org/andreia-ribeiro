/* Estado do agendamento (useReducer): etapas, valores, erros e envio. Validação pura. */

export interface BookingData {
  para: string;
  servico: string;
  evento: string;
  cerimonia: string;
  referencias: string;
  data: string;
  hora: string;
  nome: string;
  email: string;
  telefone: string;
}

export type BookingField = keyof BookingData;
export type BookingErrors = Partial<Record<BookingField, true>>;
export const TOTAL_ETAPAS = 4;

export interface BookingState {
  /** 0–3 nas etapas; 4 é a confirmação */
  etapa: number;
  values: BookingData;
  errors: BookingErrors;
  status: 'idle' | 'enviando' | 'erro';
  /** incrementa a cada tentativa inválida: dispara o foco no primeiro campo inválido */
  tentativa: number;
}

export type BookingAction =
  | { type: 'set'; field: BookingField; value: string }
  | { type: 'avancar' }
  | { type: 'voltar' }
  | { type: 'invalido'; errors: BookingErrors }
  | { type: 'enviar' }
  | { type: 'enviado' }
  | { type: 'falhou' };

export const VAZIO: BookingData = {
  para: '',
  servico: '',
  evento: '',
  cerimonia: '',
  referencias: '',
  data: '',
  hora: '',
  nome: '',
  email: '',
  telefone: '',
};

export const CAMPOS_POR_ETAPA: readonly (readonly BookingField[])[] = [
  ['para', 'servico'],
  ['evento'],
  ['data', 'hora'],
  ['nome', 'email', 'telefone'],
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function campoValido(field: BookingField, v: string): boolean {
  switch (field) {
    case 'cerimonia':
    case 'referencias':
      return true;
    case 'email':
      return EMAIL.test(v.trim());
    case 'telefone':
      return v.replace(/\D/g, '').length >= 10;
    default:
      return v.trim() !== '';
  }
}

export function validarEtapa(etapa: number, values: BookingData): BookingErrors {
  const errors: BookingErrors = {};
  for (const f of CAMPOS_POR_ETAPA[etapa] ?? []) if (!campoValido(f, values[f])) errors[f] = true;
  return errors;
}

export function initialState(values: Partial<BookingData> = {}): BookingState {
  return { etapa: 0, values: { ...VAZIO, ...values }, errors: {}, status: 'idle', tentativa: 0 };
}

export function bookingReducer(s: BookingState, a: BookingAction): BookingState {
  switch (a.type) {
    case 'set': {
      const values = { ...s.values, [a.field]: a.value };
      // o erro some assim que o campo fica válido (não antes de a pessoa tentar seguir)
      const errors =
        s.errors[a.field] && campoValido(a.field, a.value)
          ? (Object.fromEntries(Object.entries(s.errors).filter(([k]) => k !== a.field)) as BookingErrors)
          : s.errors;
      return { ...s, values, errors, status: s.status === 'erro' ? 'idle' : s.status };
    }
    case 'invalido':
      return { ...s, errors: a.errors, tentativa: s.tentativa + 1 };
    case 'avancar':
      return { ...s, etapa: Math.min(TOTAL_ETAPAS - 1, s.etapa + 1), errors: {} };
    case 'voltar':
      return { ...s, etapa: Math.max(0, s.etapa - 1), errors: {} };
    case 'enviar':
      return { ...s, status: 'enviando' };
    case 'enviado':
      return { ...s, status: 'idle', etapa: TOTAL_ETAPAS };
    case 'falhou':
      return { ...s, status: 'erro' };
  }
}
