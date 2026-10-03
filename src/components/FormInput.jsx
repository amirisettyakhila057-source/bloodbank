import { useId } from 'react';

/** Wraps a form control with its label, required marker and validation message. */
export function Field({ id, label, required, error, hint, className = '', children }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={id}>
          {label}{required && <span className="req" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error ? <p id={`${id}-error`} className="field-error">{error}</p>
        : hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>
  );
}

export const controlProps = (id, error, hint) => ({
  id,
  className: `control ${error ? 'is-invalid' : ''}`,
  'aria-invalid': Boolean(error),
  'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
});

/** Labelled input or textarea (as="textarea") with inline validation message. */
export default function FormInput({ label, error, hint, as: Control = 'input', required, className, ...props }) {
  const id = useId();
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <Control {...controlProps(id, error, hint)} {...props} />
    </Field>
  );
}
