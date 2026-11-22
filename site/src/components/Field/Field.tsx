import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon';
import './Field.css';

interface FieldShared {
  label: ReactNode;
  /** marca "(opcional)" — nunca asterisco para obrigatório */
  opcional?: boolean;
  rotuloOpcional?: string;
  /** dica sempre visível abaixo */
  hint?: ReactNode;
  /** mensagem que diz o que fazer, mostrada quando invalid */
  error?: ReactNode;
  invalid?: boolean;
  /** linha em costura firme (bronze) quando preenchido e válido */
  valid?: boolean;
  className?: string;
}

type InputField = FieldShared & { control?: 'input' } & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'className'
  >;
type SelectField = FieldShared & { control: 'select' } & Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'className'
  >;
type TextareaField = FieldShared & { control: 'textarea' } & Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className'
  >;

export type FieldProps = InputField | SelectField | TextareaField;
type ControlElement = HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;

/**
 * Campo sem caixa: rótulo sempre visível acima; linha em pesponto que vira costura firme ao focar.
 * Erro: linha em terracota + ícone + frase, com aria-invalid e aria-describedby.
 */
export const Field = forwardRef<ControlElement, FieldProps>(function Field(props, ref) {
  const {
    label,
    opcional = false,
    rotuloOpcional = '(opcional)',
    hint,
    error,
    invalid = false,
    valid = false,
    className,
    id: idProp,
    'aria-describedby': describedBy,
    ...rest
  } = props;
  const auto = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = idProp ?? `f-${auto}`;
  const hintId = hint ? `${id}-h` : undefined;
  const errorId = error ? `${id}-e` : undefined;
  const described =
    [describedBy, hintId, invalid ? errorId : undefined].filter(Boolean).join(' ') || undefined;
  const common = {
    id,
    className: 'at-field__control',
    'aria-invalid': invalid,
    'aria-describedby': described,
  };

  let control: ReactNode;
  if (rest.control === 'select') {
    const { control: _c, ...select } = rest;
    control = <select {...select} {...common} ref={ref} />;
  } else if (rest.control === 'textarea') {
    const { control: _c, ...textarea } = rest;
    control = <textarea {...textarea} {...common} ref={ref} />;
  } else {
    const { control: _c, ...input } = rest;
    control = <input {...input} {...common} ref={ref} />;
  }

  return (
    <div className={cx('at-field', invalid && 'is-invalid', valid && !invalid && 'is-valid', className)}>
      <label className="at-field__label" htmlFor={id}>
        {label}
        {opcional ? (
          <>
            {' '}
            <span className="at-opt">{rotuloOpcional}</span>
          </>
        ) : null}
      </label>
      <div className="at-field__wrap">
        {control}
        <span className="at-field__line" />
      </div>
      {hint ? (
        <span className="at-field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="at-field__error" id={errorId}>
          <Icon name="alerta" size="s" />
          {error}
        </span>
      ) : null}
    </div>
  );
});
