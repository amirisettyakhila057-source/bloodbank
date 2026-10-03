import { useState } from 'react';
import { validate } from '../utils/validation';

/**
 * Small form helper: controlled values, schema validation on submit and
 * live re-validation of fields once the user has tried to submit.
 */
export function useForm(initialValues, schema) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (submitted) setErrors(validate(next, schema));
  };

  const handleSubmit = (onValid) => async (event) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validate(values, schema);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = document.querySelector(`[name="${Object.keys(found)[0]}"]`);
      first?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onValid(values);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = (next = initialValues) => {
    setValues(next);
    setErrors({});
    setSubmitted(false);
  };

  // Props spread onto FormInput / Select for a field.
  const field = (name) => ({ name, value: values[name] ?? '', onChange: handleChange, error: errors[name] });

  return { values, setValues, errors, setErrors, submitting, handleChange, handleSubmit, reset, field };
}
