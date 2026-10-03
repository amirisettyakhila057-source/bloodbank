import FormInput from './FormInput';
import Select from './Select';
import { useForm } from '../hooks/useForm';
import { donorSchema } from '../utils/validation';
import { BLOOD_GROUPS, CITIES, GENDERS, RECORD_STATUSES } from '../utils/constants';
import { todayISO } from '../utils/format';

export const EMPTY_DONOR = {
  fullName: '', age: '', gender: '', bloodGroup: '', phone: '', email: '',
  city: '', address: '', lastDonationDate: '', emergencyContact: '', status: 'Active',
};

/**
 * Donor details form used by admins (Donors page) and users (Become a Donor).
 * onSubmit(values) must return { ok, message, field? }.
 */
export default function DonorForm({ initialValues = EMPTY_DONOR, onSubmit, onCancel, submitLabel = 'Save donor', showStatus, formId }) {
  const { field, setErrors, handleSubmit, submitting } = useForm({ ...EMPTY_DONOR, ...initialValues }, donorSchema);

  const submit = handleSubmit(async (values) => {
    const result = await onSubmit(values);
    if (!result.ok && result.message.includes('email')) setErrors({ email: result.message });
  });

  return (
    <form id={formId} className="form-stack" onSubmit={submit} noValidate>
      <div className="form-grid">
        <FormInput label="Full name" autoComplete="name" required {...field('fullName')} />
        <FormInput label="Age" type="number" min="18" max="65" required hint="Donors must be 18–65 years old" {...field('age')} />
        <Select label="Gender" placeholder="Select gender" options={GENDERS} required {...field('gender')} />
        <Select label="Blood group" placeholder="Select blood group" options={BLOOD_GROUPS} required {...field('bloodGroup')} />
        <FormInput label="Phone" type="tel" autoComplete="tel" required {...field('phone')} />
        <FormInput label="Email" type="email" autoComplete="email" required {...field('email')} />
        <FormInput label="City" list="city-options" required {...field('city')} />
        <FormInput label="Emergency contact" type="tel" required hint="Phone number of a family member or friend" {...field('emergencyContact')} />
        <FormInput label="Address" as="textarea" rows={2} required className="span-2" {...field('address')} />
        <FormInput label="Last donation date" type="date" max={todayISO()} hint="Leave empty if you have never donated" {...field('lastDonationDate')} />
        {showStatus && <Select label="Status" options={RECORD_STATUSES} {...field('status')} />}
      </div>
      <datalist id="city-options">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitLabel}</button>
      </div>
    </form>
  );
}
