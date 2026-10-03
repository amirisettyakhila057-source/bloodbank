import { useId } from 'react';
import { Field, controlProps } from './FormInput';

/** Labelled select. `options` can be strings or { value, label } objects. */
export default function Select({ label, error, hint, options, placeholder, required, className, ...props }) {
  const id = useId();
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <select {...controlProps(id, error, hint)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
      </select>
    </Field>
  );
}
