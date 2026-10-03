import { useState } from 'react';
import { Building2, Eye, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import SearchInput from '../components/SearchInput';
import Select from '../components/Select';
import FormInput from '../components/FormInput';
import Modal, { ConfirmDialog } from '../components/Modal';
import Badge from '../components/Badge';
import { useStore } from '../hooks/useStore';
import { useForm } from '../hooks/useForm';
import { useToast } from '../context/ToastContext';
import { getHospitals, saveHospitals, getBloodRequests } from '../utils/localStorage';
import { hospitalSchema } from '../utils/validation';
import { CITIES, RECORD_STATUSES } from '../utils/constants';
import { matchesSearch, nextId } from '../utils/format';

const EMPTY = {
  name: '', contactPerson: '', phone: '', email: '', city: '', address: '', registrationNumber: '', status: 'Active',
};

export default function Hospitals() {
  const hospitals = useStore(getHospitals);
  const requests = useStore(getBloodRequests);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ city: '', status: '' });
  const [modal, setModal] = useState(null); // { type: 'form' | 'view' | 'delete', hospital }
  const close = () => setModal(null);
  const setFilter = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const rows = hospitals.filter((h) =>
    matchesSearch(h, query, ['id', 'name', 'contactPerson', 'email', 'registrationNumber'])
    && (!filters.city || h.city === filters.city)
    && (!filters.status || h.status === filters.status));

  const handleSave = (values) => {
    const existing = modal.hospital;
    if (hospitals.some((h) => h.registrationNumber === values.registrationNumber.trim() && h.id !== existing?.id)) {
      return { ok: false, field: 'registrationNumber', message: 'This registration number is already in use.' };
    }
    const clean = { ...values, name: values.name.trim(), registrationNumber: values.registrationNumber.trim() };
    if (existing) {
      saveHospitals(hospitals.map((h) => (h.id === existing.id ? { ...h, ...clean } : h)));
      toast.success('Hospital updated successfully.');
    } else {
      saveHospitals([{ ...clean, id: nextId(hospitals, 'H', 101) }, ...hospitals]);
      toast.success('Hospital added successfully.');
    }
    close();
    return { ok: true };
  };

  const toggleStatus = (h) => {
    const status = h.status === 'Active' ? 'Inactive' : 'Active';
    saveHospitals(hospitals.map((x) => (x.id === h.id ? { ...x, status } : x)));
    toast.success(`${h.name} marked as ${status.toLowerCase()}.`);
  };

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    {
      key: 'name', header: 'Hospital', sortable: true,
      render: (h) => <div className="cell-stack"><strong>{h.name}</strong><span>Reg. {h.registrationNumber}</span></div>,
    },
    { key: 'contactPerson', header: 'Contact person', sortable: true },
    { key: 'phone', header: 'Contact', render: (h) => <div className="cell-stack"><span>{h.phone}</span><span>{h.email}</span></div> },
    { key: 'city', header: 'City', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (h) => <Badge>{h.status}</Badge> },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (h) => (
        <div className="row-actions">
          <button type="button" className="icon-btn" title="View" aria-label={`View ${h.name}`} onClick={() => setModal({ type: 'view', hospital: h })}><Eye size={16} /></button>
          <button type="button" className="icon-btn" title="Edit" aria-label={`Edit ${h.name}`} onClick={() => setModal({ type: 'form', hospital: h })}><Pencil size={16} /></button>
          <button type="button" className="icon-btn" title={h.status === 'Active' ? 'Deactivate' : 'Activate'} aria-label={`Toggle status of ${h.name}`} onClick={() => toggleStatus(h)}><Power size={16} /></button>
          <button type="button" className="icon-btn icon-btn-danger" title="Delete" aria-label={`Delete ${h.name}`} onClick={() => setModal({ type: 'delete', hospital: h })}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  const viewing = modal?.type === 'view' ? modal.hospital : null;
  const hospitalRequests = viewing ? requests.filter((r) => r.hospitalName === viewing.name) : [];

  return (
    <>
      <PageHeader
        title="Hospitals"
        description="Partner hospitals that can raise blood requests."
        actions={<button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'form' })}><Plus size={16} aria-hidden="true" /> Add hospital</button>}
      />
      <div className="card">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search name, ID, registration…" label="Search hospitals" />
          <div className="toolbar-filters">
            <Select aria-label="Filter by city" name="city" value={filters.city} onChange={setFilter} placeholder="All cities" options={CITIES} />
            <Select aria-label="Filter by status" name="status" value={filters.status} onChange={setFilter} placeholder="All statuses" options={RECORD_STATUSES} />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          caption="Hospitals"
          emptyIcon={Building2}
          emptyTitle="No hospitals found"
          emptyMessage="There are currently no hospitals matching your search or filters."
        />
      </div>

      <Modal open={modal?.type === 'form'} title={modal?.hospital ? 'Edit hospital' : 'Add hospital'} onClose={close} size="lg">
        <HospitalForm key={modal?.hospital?.id || 'new'} initialValues={modal?.hospital || EMPTY} onSubmit={handleSave} onCancel={close} />
      </Modal>

      <Modal open={Boolean(viewing)} title={viewing?.name} description={viewing && `${viewing.id} · ${viewing.city}`} onClose={close}>
        {viewing && (
          <dl className="detail-grid">
            <div><dt>Status</dt><dd><Badge>{viewing.status}</Badge></dd></div>
            <div><dt>Registration no.</dt><dd>{viewing.registrationNumber}</dd></div>
            <div><dt>Contact person</dt><dd>{viewing.contactPerson}</dd></div>
            <div><dt>Phone</dt><dd>{viewing.phone}</dd></div>
            <div><dt>Email</dt><dd>{viewing.email}</dd></div>
            <div><dt>Blood requests</dt><dd>{hospitalRequests.length} total · {hospitalRequests.filter((r) => r.status === 'Pending').length} pending</dd></div>
            <div className="span-2"><dt>Address</dt><dd>{viewing.address}</dd></div>
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={modal?.type === 'delete'}
        title="Delete hospital?"
        message={`${modal?.hospital?.name} will be removed permanently. Existing blood requests keep the hospital name.`}
        confirmLabel="Delete hospital"
        danger
        onClose={close}
        onConfirm={() => {
          saveHospitals(hospitals.filter((h) => h.id !== modal.hospital.id));
          toast.success('Hospital deleted.');
          close();
        }}
      />
    </>
  );
}

function HospitalForm({ initialValues, onSubmit, onCancel }) {
  const { field, setErrors, handleSubmit } = useForm(initialValues, hospitalSchema);
  const submit = handleSubmit((values) => {
    const result = onSubmit(values);
    if (!result.ok) setErrors({ [result.field]: result.message });
  });
  return (
    <form className="form-stack" onSubmit={submit} noValidate>
      <div className="form-grid">
        <FormInput label="Hospital name" required className="span-2" {...field('name')} />
        <FormInput label="Contact person" required {...field('contactPerson')} />
        <FormInput label="Registration number" required placeholder="e.g. TS-HOS-2024-0001" {...field('registrationNumber')} />
        <FormInput label="Phone" type="tel" required {...field('phone')} />
        <FormInput label="Email" type="email" required {...field('email')} />
        <Select label="City" placeholder="Select city" options={CITIES} required {...field('city')} />
        <Select label="Status" options={RECORD_STATUSES} {...field('status')} />
        <FormInput label="Address" as="textarea" rows={2} required className="span-2" {...field('address')} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save hospital</button>
      </div>
    </form>
  );
}
