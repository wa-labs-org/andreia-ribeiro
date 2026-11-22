import { forwardRef, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon';
import './Choice.css';

export interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  type?: 'radio' | 'checkbox';
  children: ReactNode;
}

/** Rádio/checkbox real (acessível) com aparência de etiqueta de prova, 44px. */
export const Choice = forwardRef<HTMLInputElement, ChoiceProps>(function Choice(
  { type = 'radio', className, children, ...rest },
  ref,
) {
  return (
    <label className={cx('at-choice', className)}>
      <input {...rest} ref={ref} type={type} />
      <span>{children}</span>
    </label>
  );
});

export interface DateChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  /** dia da semana em mono, ex.: "qui" */
  diaSemana: string;
  /** número do dia em Fraunces */
  dia: number | string;
  /** mês abreviado, ex.: "mar" */
  mes: string;
  /** sem vaga: desabilitada e com o rótulo de lotado no lugar do mês */
  lotado?: boolean;
  rotuloLotado?: string;
}

/** Data de prova: dia da semana, número e mês (ou "lotado"). */
export const DateChoice = forwardRef<HTMLInputElement, DateChoiceProps>(function DateChoice(
  { diaSemana, dia, mes, lotado = false, rotuloLotado = 'lotado', disabled, className, ...rest },
  ref,
) {
  return (
    <label className={cx('at-choice', className)}>
      <input {...rest} ref={ref} type="radio" disabled={disabled ?? lotado} />
      <span>
        <small className="at-note">{diaSemana}</small>
        <b>{dia}</b>
        <small className="at-note">{lotado ? rotuloLotado : mes}</small>
      </span>
    </label>
  );
});

export interface ChoiceGroupProps {
  legend: ReactNode;
  /** h3 para o título da etapa, label para subgrupos */
  legendClassName?: 'at-h3' | 'at-label';
  /** datas: grade .at-dates em vez de chips */
  layout?: 'chips' | 'datas';
  error?: ReactNode;
  invalid?: boolean;
  className?: string;
  children: ReactNode;
  legendRef?: Ref<HTMLLegendElement>;
}

/** Grupo de escolhas em <fieldset>; o erro é anunciado (role="alert") e nunca depende só da cor. */
export function ChoiceGroup({
  legend,
  legendClassName = 'at-label',
  layout = 'chips',
  error,
  invalid = false,
  className,
  children,
  legendRef,
}: ChoiceGroupProps) {
  return (
    <fieldset className={cx('at-fieldset', invalid && 'is-invalid', className)}>
      <legend className={legendClassName} ref={legendRef} tabIndex={legendRef ? -1 : undefined}>
        {legend}
      </legend>
      <div className={layout === 'datas' ? 'at-dates' : 'at-choices'}>{children}</div>
      {invalid && error ? (
        <span className="at-field__error" role="alert">
          <Icon name="alerta" size="s" />
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}

export interface DataDeProva {
  /** AAAA-MM-DD */
  iso: string;
  diaSemana: string;
  dia: number;
  mes: string;
  lotado: boolean;
}

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/**
 * Próximos dias de prova a partir de amanhã (padrão: 10 datas, quintas, sextas e sábados).
 * `lotadas`: datas ISO sem vaga (vêm da agenda real).
 */
export function proximasDatasDeProva({
  quantidade = 10,
  diasDaSemana = [4, 5, 6],
  inicio = new Date(),
  lotadas = [],
}: {
  quantidade?: number;
  diasDaSemana?: readonly number[];
  inicio?: Date;
  lotadas?: readonly string[];
} = {}): DataDeProva[] {
  const d = new Date(inicio);
  d.setHours(12, 0, 0, 0);
  const out: DataDeProva[] = [];
  for (let guard = 0; out.length < quantidade && guard < 400; guard++) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (!diasDaSemana.includes(wd)) continue;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({
      iso,
      diaSemana: DIAS[wd] ?? '',
      dia: d.getDate(),
      mes: MESES[d.getMonth()] ?? '',
      lotado: lotadas.includes(iso),
    });
  }
  return out;
}
