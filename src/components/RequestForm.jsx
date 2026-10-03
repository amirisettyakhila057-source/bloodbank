import FormInput from './FormInput';
import Select from './Select';
import { useForm } from '../hooks/useForm';
import { useStore } from '../hooks/useStore';
import { getHospitals } from '../utils/localStorage';
import { requestSchema } from '../utils/validation';
import { BLOOD_GROUPS, PRIORITIES } from '../utils/constants';
import { todayISO } from '../utils/format';

const EMPTY = {
  hospitalName: '', patientName: '', bloodGroup: '', units: '1', requiredDate: '', priority: 'Normal',
  doctorName: '', contactNumber: '', reason: '', notes: '',
};

export default function RequestForm({ initialValues, onSubmit, onCancel }) {
  const hospitals = useStore(getHospitals);
  const { field, values, handleSubmit, submitting } = useForm({ ...EMPTY, ...initialValues }, requestSchema);

  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
      {values.priority === 'Emergency' && (
        <div className="alert alert-error">Emergency requests are highlighted and shown first to the blood bank team.</div>
      )}
      <div className="form-grid">
        <FormInput label="Hospital name" list="hospital-options" required {...field('hospitalName')} />
        <FormInput label="Patient name" required {...field('patientName')} />
        <Select label="Blood group" placeholder="Select blood group" options={BLOOD_GROUPS} required {...field('bloodGroup')} />
        <FormInput label="Required units" type="number" min="1" max="10" required {...field('units')} />
        <FormInput label="Required date" type="date" min={todayISO()} required {...field('requiredDate')} />
        <Select label="Priority" options={PRIORITIES} required {...field('priority')} />
        <FormInput label="Doctor name" required {...field('doctorName')} />
        <FormInput label="Contact number" type="tel" required {...field('contactNumber')} />
        <FormInput label="Reason" required className="span-2" placeholder="e.g. Scheduled surgery" {...field('reason')} />
        <FormInput label="Additional notes" as="textarea" rows={2} className="span-2" {...field('notes')} />
      </div>
      <datalist id="hospital-options">
        {hospitals.filter((h) => h.status === 'Active').map((h) => <option key={h.id} value={h.name} />)}
      </datalist>
      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>Submit request</button>
      </div>
    </form>
  );
}
