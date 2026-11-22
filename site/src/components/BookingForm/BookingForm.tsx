import { useEffect, useReducer, useRef, type FormEvent, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { isReduced } from '../../motion/motionStore';
import { Button } from '../Button';
import { Choice, ChoiceGroup, DateChoice, type DataDeProva } from '../Choice';
import { Field } from '../Field';
import { Tag } from '../Tag';
import {
  TOTAL_ETAPAS,
  bookingReducer,
  initialState,
  validarEtapa,
  type BookingData,
  type BookingField,
} from './bookingState';
import { TEXTOS_PADRAO, type BookingTextos } from './textos';
import './BookingForm.css';

export interface Opcao {
  valor: string;
  /** rótulo visível (padrão: o valor) */
  label?: ReactNode;
  /** sem vaga / indisponível */
  lotado?: boolean;
}

export interface BookingFormProps {
  /** envio assíncrono; rejeite a promise para mostrar a mensagem de falha */
  onSubmit: (data: BookingData) => Promise<void>;
  /** próximos dias de prova (use proximasDatasDeProva) */
  datas: readonly DataDeProva[];
  horarios: readonly Opcao[];
  opcoesPara?: readonly Opcao[];
  opcoesServico?: readonly Opcao[];
  cerimonias?: readonly string[];
  /** microcopy (padrão em pt-BR, no tom do sistema) */
  textos?: Partial<BookingTextos>;
  /** conteúdo extra da confirmação, depois do texto */
  confirmacao?: (data: BookingData) => ReactNode;
  valoresIniciais?: Partial<BookingData>;
  'aria-labelledby'?: string;
  className?: string;
}

const PARA: readonly Opcao[] = [
  { valor: 'Noiva' },
  { valor: 'Madrinha' },
  { valor: 'Noivo' },
  { valor: 'Padrinho' },
  { valor: 'Outra ocasião' },
];
const SERVICO: readonly Opcao[] = [
  { valor: 'Sob medida', label: 'Peça sob medida' },
  { valor: 'Ajuste', label: 'Ajuste de peça pronta' },
];
const CERIMONIAS = ['Civil', 'Religiosa', 'Ao ar livre', 'Ainda não sei'];

/**
 * Agendamento de prova em 4 etapas: 01 Peça → 02 O dia → 03 Prova → 04 Contato → confirmação.
 * Ao avançar, o título da etapa recebe foco; com erro, o foco vai ao primeiro campo inválido.
 * Envio com pontos de costura no botão; confirmação em role="status" com o nó de arremate.
 */
export function BookingForm({
  onSubmit,
  datas,
  horarios,
  opcoesPara = PARA,
  opcoesServico = SERVICO,
  cerimonias = CERIMONIAS,
  textos: textosProp,
  confirmacao,
  valoresIniciais,
  'aria-labelledby': labelledBy,
  className,
}: BookingFormProps) {
  const t: BookingTextos = {
    ...TEXTOS_PADRAO,
    ...textosProp,
    erros: { ...TEXTOS_PADRAO.erros, ...textosProp?.erros },
  };
  const [s, dispatch] = useReducer(bookingReducer, valoresIniciais, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef(true);
  const { values, errors, etapa } = s;
  const done = etapa >= TOTAL_ETAPAS;

  // nova etapa: o título recebe foco (e a etapa sobe pela animação do painel)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const form = formRef.current;
    if (form && form.getBoundingClientRect().top < 0) {
      const top = form.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: isReduced() ? 'auto' : 'smooth' });
    }
  }, [etapa]);

  // tentativa inválida: foco no primeiro campo inválido (na ordem do formulário)
  useEffect(() => {
    if (!s.tentativa) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"], .at-fieldset.is-invalid input:not(:disabled)')
      ?.focus();
  }, [s.tentativa]);

  const set = (field: BookingField) => (value: string) => {
    dispatch({ type: 'set', field, value });
  };
  const setHeading = (el: HTMLElement | null): void => {
    headingRef.current = el;
  };

  const tryAdvance = (): boolean => {
    const errs = validarEtapa(etapa, values);
    if (Object.keys(errs).length) {
      dispatch({ type: 'invalido', errors: errs });
      return false;
    }
    return true;
  };

  const onFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (s.status === 'enviando') return;
    if (etapa < TOTAL_ETAPAS - 1) {
      if (tryAdvance()) dispatch({ type: 'avancar' });
      return;
    }
    if (!tryAdvance()) return;
    dispatch({ type: 'enviar' });
    onSubmit(values).then(
      () => {
        dispatch({ type: 'enviado' });
      },
      () => {
        dispatch({ type: 'falhou' });
      },
    );
  };

  const radios = (field: BookingField, opcoes: readonly Opcao[]) =>
    opcoes.map((o) => (
      <Choice
        key={o.valor}
        name={field}
        value={o.valor}
        checked={values[field] === o.valor}
        disabled={o.lotado}
        onChange={(e) => {
          set(field)(e.target.value);
        }}
      >
        {o.label ?? o.valor}
      </Choice>
    ));

  const nav = (
    <div className="at-form__nav" style={{ marginTop: 'var(--at-space-7)' }}>
      {etapa === 0 ? (
        <span className="at-note">{t.contadorEtapa(1, TOTAL_ETAPAS)}</span>
      ) : (
        <Button
          variante="linha"
          seta="esquerda"
          onClick={() => {
            dispatch({ type: 'voltar' });
          }}
        >
          {t.voltar}
        </Button>
      )}
      {etapa < TOTAL_ETAPAS - 1 ? (
        <Button type="submit" seta="direita">
          {t.continuar}
        </Button>
      ) : (
        <Button type="submit" botao loading={s.status === 'enviando'}>
          {t.confirmar}
        </Button>
      )}
    </div>
  );

  return (
    <form
      ref={formRef}
      className={cx('at-form', className)}
      noValidate
      aria-labelledby={labelledBy}
      onSubmit={onFormSubmit}
    >
      <ol
        className="at-form__steps"
        role="list"
        aria-label={t.rotuloEtapas}
        aria-hidden={done ? true : undefined}
      >
        {t.etapas.map((rotulo, i) => (
          <li
            key={rotulo}
            className={cx((done || i < etapa) && 'is-done')}
            aria-current={!done && i === etapa ? 'step' : undefined}
          >
            <span className="at-note">{rotulo}</span>
          </li>
        ))}
      </ol>

      {etapa === 0 ? (
        <div className="at-form__panel" key="p0">
          <ChoiceGroup
            legend={t.para}
            legendClassName="at-h3"
            legendRef={setHeading}
            invalid={!!errors.para}
            error={t.erros.para}
          >
            {radios('para', opcoesPara)}
          </ChoiceGroup>
          <ChoiceGroup
            legend={t.servico}
            invalid={!!errors.servico}
            error={t.erros.servico}
            className="at-booking__group"
          >
            {radios('servico', opcoesServico)}
          </ChoiceGroup>
          {nav}
        </div>
      ) : null}

      {etapa === 1 ? (
        <div className="at-form__panel" key="p1">
          <fieldset className="at-fieldset">
            <legend className="at-h3" ref={setHeading} tabIndex={-1}>
              {t.dia}
            </legend>
            <div className="at-form__row at-form__row--2">
              <Field
                label={t.evento}
                type="date"
                name="evento"
                required
                value={values.evento}
                onChange={(e) => {
                  set('evento')(e.target.value);
                }}
                invalid={!!errors.evento}
                valid={!!values.evento}
                error={t.erros.evento}
              />
              <Field
                control="select"
                label={t.cerimonia}
                opcional
                name="cerimonia"
                value={values.cerimonia}
                onChange={(e) => {
                  set('cerimonia')(e.target.value);
                }}
              >
                <option value="">{t.escolha}</option>
                {cerimonias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Field>
            </div>
            <Field
              control="textarea"
              label={t.referencias}
              opcional
              name="referencias"
              placeholder={t.referenciasPlaceholder}
              hint={t.referenciasHint}
              value={values.referencias}
              onChange={(e) => {
                set('referencias')(e.target.value);
              }}
            />
          </fieldset>
          {nav}
        </div>
      ) : null}

      {etapa === 2 ? (
        <div className="at-form__panel" key="p2">
          <ChoiceGroup
            legend={t.diaProva}
            legendClassName="at-h3"
            legendRef={setHeading}
            layout="datas"
            invalid={!!errors.data}
            error={t.erros.data}
          >
            {datas.map((d) => (
              <DateChoice
                key={d.iso}
                name="data"
                value={d.iso}
                diaSemana={d.diaSemana}
                dia={d.dia}
                mes={d.mes}
                lotado={d.lotado}
                checked={values.data === d.iso}
                onChange={(e) => {
                  set('data')(e.target.value);
                }}
              />
            ))}
          </ChoiceGroup>
          <ChoiceGroup
            legend={t.horario}
            invalid={!!errors.hora}
            error={t.erros.hora}
            className="at-booking__group at-booking__group--s"
          >
            {radios('hora', horarios)}
          </ChoiceGroup>
          {nav}
        </div>
      ) : null}

      {etapa === 3 ? (
        <div className="at-form__panel" key="p3">
          <fieldset className="at-fieldset">
            <legend className="at-h3" ref={setHeading} tabIndex={-1}>
              {t.contato}
            </legend>
            <Field
              label={t.nome}
              name="nome"
              required
              autoComplete="name"
              value={values.nome}
              onChange={(e) => {
                set('nome')(e.target.value);
              }}
              invalid={!!errors.nome}
              error={t.erros.nome}
            />
            <div className="at-form__row at-form__row--2">
              <Field
                label={t.email}
                type="email"
                name="email"
                required
                autoComplete="email"
                value={values.email}
                onChange={(e) => {
                  set('email')(e.target.value);
                }}
                invalid={!!errors.email}
                error={t.erros.email}
              />
              <Field
                label={t.telefone}
                type="tel"
                name="telefone"
                required
                minLength={10}
                autoComplete="tel"
                inputMode="tel"
                placeholder={t.telefonePlaceholder}
                value={values.telefone}
                onChange={(e) => {
                  set('telefone')(e.target.value);
                }}
                invalid={!!errors.telefone}
                error={t.erros.telefone}
              />
            </div>
          </fieldset>
          {s.status === 'erro' ? (
            <p className="at-field__error at-booking__falha" role="alert">
              {t.falhaEnvio}
            </p>
          ) : null}
          {nav}
        </div>
      ) : null}

      {done ? (
        <div className="at-form__panel at-form__done" role="status">
          <svg
            width="96"
            height="64"
            viewBox="0 0 96 64"
            fill="none"
            style={{ stroke: 'var(--at-color-dourado)' }}
            strokeWidth={1.25}
            aria-hidden="true"
            focusable="false"
          >
            <path pathLength={1} d="M2 40C20 40 30 20 46 22s14 26 0 26-10-30 8-30 24 22 40 22" />
          </svg>
          <h3 className="at-h2" ref={setHeading} tabIndex={-1}>
            {t.confirmadoTitulo}
          </h3>
          <p className="at-body at-measure">{t.confirmadoTexto}</p>
          {values.para ? (
            <Tag>
              {t.confirmadoPara} {values.para.toLowerCase()}
            </Tag>
          ) : null}
          {confirmacao?.(values)}
        </div>
      ) : null}
    </form>
  );
}
