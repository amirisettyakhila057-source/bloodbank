import { useState } from 'react';
import { Eye, Pencil, Plus, Trash2, Power, HeartPulse, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import SearchInput from '../components/SearchInput';
import Select from '../components/Select';
import Modal, { ConfirmDialog } from '../components/Modal';
import Badge, { BloodGroupTag } from '../components/Badge';
import DonorForm from '../components/DonorForm';
import EligibilityNote from '../components/EligibilityNote';
import { useStore } from '../hooks/useStore';
import { useToast } from '../context/ToastContext';
import { getDonors, getDonationHistory } from '../utils/localStorage';
import { saveDonor, setDonorStatus, deleteDonor, recordDonation } from '../utils/bloodService';
import { BLOOD_BANKS, BLOOD_GROUPS, CITIES, RECORD_STATUSES } from '../utils/constants';
import { formatDate, matchesSearch } from '../utils/format';

export default function Donors() {
  const donors = useStore(getDonors);
  const history = useStore(getDonationHistory);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ bloodGroup: '', city: '', status: '' });
  // modal: { type: 'add' | 'edit' | 'view' | 'delete' | 'donate', donor }
  const [modal, setModal] = useState(null);
  const [bankId, setBankId] = useState(BLOOD_BANKS[0].id);
  const close = () => setModal(null);

  const rows = donors.filter((d) =>
    matchesSearch(d, query, ['id', 'fullName', 'email', 'phone', 'city'])
    && (!filters.bloodGroup || d.bloodGroup === filters.bloodGroup)
    && (!filters.city || d.city === filters.city)
    && (!filters.status || d.status === filters.status));

  const setFilter = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = (values) => {
    const result = saveDonor(values, { id: modal.donor?.id });
    toast.result(result);
    if (result.ok) close();
    return result;
  };

  const toggleStatus = (donor) => {
    const status = donor.status === 'Active' ? 'Inactive' : 'Active';
    setDonorStatus(donor.id, status);
    toast.success(`${donor.fullName} marked as ${status.toLowerCase()}.`);
  };

  const columns = [
    { key: 'id', header: 'Donor ID', sortable: true },
    {
      key: 'fullName', header: 'Name', sortable: true,
      render: (d) => <div className="cell-stack"><strong>{d.fullName}</strong><span>{d.age} yrs · {d.gender}</span></div>,
    },
    { key: 'bloodGroup', header: 'Group', sortable: true, render: (d) => <BloodGroupTag group={d.bloodGroup} /> },
    { key: 'phone', header: 'Contact', render: (d) => <div className="cell-stack"><span>{d.phone}</span><span>{d.email}</span></div> },
    { key: 'city', header: 'City', sortable: true },
    { key: 'lastDonationDate', header: 'Last donation', sortable: true, render: (d) => formatDate(d.lastDonationDate) },
    { key: 'status', header: 'Status', sortable: true, render: (d) => <Badge>{d.status}</Badge> },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (d) => (
        <div className="row-actions">
          <button type="button" className="icon-btn" title="View details" aria-label={`View ${d.fullName}`} onClick={() => setModal({ type: 'view', donor: d })}><Eye size={16} /></button>
          <button type="button" className="icon-btn" title="Record donation" aria-label={`Record donation for ${d.fullName}`} onClick={() => setModal({ type: 'donate', donor: d })}><HeartPulse size={16} /></button>
          <button type="button" className="icon-btn" title="Edit" aria-label={`Edit ${d.fullName}`} onClick={() => setModal({ type: 'edit', donor: d })}><Pencil size={16} /></button>
          <button type="button" className="icon-btn" title={d.status === 'Active' ? 'Deactivate' : 'Activate'} aria-label={`${d.status === 'Active' ? 'Deactivate' : 'Activate'} ${d.fullName}`} onClick={() => toggleStatus(d)}><Power size={16} /></button>
          <button type="button" className="icon-btn icon-btn-danger" title="Delete" aria-label={`Delete ${d.fullName}`} onClick={() => setModal({ type: 'delete', donor: d })}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  const viewing = modal?.type === 'view' ? modal.donor : null;
  const donating = modal?.type === 'donate' ? modal.donor : null;
  const donorHistory = viewing ? history.filter((h) => h.donorId === viewing.id) : [];

  return (
    <>
      <PageHeader
        title="Donors"
        description="Register, update and track blood donors."
        actions={<button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'add' })}><Plus size={16} aria-hidden="true" /> Add donor</button>}
      />

      <div className="card">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search name, ID, email, phone…" label="Search donors" />
          <div className="toolbar-filters">
            <Select aria-label="Filter by blood group" name="bloodGroup" value={filters.bloodGroup} onChange={setFilter} placeholder="All groups" options={BLOOD_GROUPS} />
            <Select aria-label="Filter by city" name="city" value={filters.city} onChange={setFilter} placeholder="All cities" options={CITIES} />
            <Select aria-label="Filter by status" name="status" value={filters.status} onChange={setFilter} placeholder="All statuses" options={RECORD_STATUSES} />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          caption="Donors"
          emptyIcon={Users}
          emptyTitle="No donors found"
          emptyMessage="There are currently no donors matching your search or filters."
        />
      </div>

      <Modal
        open={modal?.type === 'add' || modal?.type === 'edit'}
        title={modal?.type === 'edit' ? 'Edit donor' : 'Add donor'}
        description={modal?.type === 'edit' ? modal.donor.id : 'Fields marked * are required.'}
        onClose={close}
        size="lg"
      >
        <DonorForm
          key={modal?.donor?.id || 'new'}
          initialValues={modal?.donor}
          onSubmit={handleSave}
          onCancel={close}
          submitLabel={modal?.type === 'edit' ? 'Save changes' : 'Add donor'}
          showStatus
        />
      </Modal>

      <Modal open={Boolean(viewing)} title={viewing?.fullName} description={viewing?.id} onClose={close} size="lg">
        {viewing && <DonorDetails donor={viewing} history={donorHistory} />}
      </Modal>

      <Modal
        open={Boolean(donating)}
        title="Record donation"
        description={donating && `${donating.fullName} · ${donating.bloodGroup}`}
        onClose={close}
        size="sm"
        footer={(
          <>
            <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const result = recordDonation(donating.id, bankId);
                toast.result(result);
                if (result.ok) close();
              }}
            >
              Record 1 unit
            </button>
          </>
        )}
      >
        {donating && (
          <div className="form-stack">
            <Select label="Collected at" value={bankId} onChange={(e) => setBankId(e.target.value)} options={BLOOD_BANKS.map((b) => ({ value: b.id, label: `${b.name} · ${b.city}` }))} />
            <EligibilityNote lastDonationDate={donating.lastDonationDate} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={modal?.type === 'delete'}
        title="Delete donor?"
        message={`${modal?.donor?.fullName} will be removed permanently. Consider deactivating instead to keep their history.`}
        confirmLabel="Delete donor"
        danger
        onClose={close}
        onConfirm={() => {
          deleteDonor(modal.donor.id);
          toast.success('Donor deleted.');
          close();
        }}
      />
    </>
  );
}

function DonorDetails({ donor, history }) {
  const details = [
    ['Blood group', <BloodGroupTag key="g" group={donor.bloodGroup} />],
    ['Status', <Badge key="s">{donor.status}</Badge>],
    ['Age / Gender', `${donor.age} · ${donor.gender}`],
    ['Phone', donor.phone],
    ['Email', donor.email],
    ['Emergency contact', donor.emergencyContact || '—'],
    ['City', donor.city],
    ['Address', donor.address],
    ['Last donation', formatDate(donor.lastDonationDate)],
    ['Registered on', formatDate(donor.registeredAt)],
  ];
  return (
    <div className="form-stack">
      <dl className="detail-grid">
        {details.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      <EligibilityNote lastDonationDate={donor.lastDonationDate} />
      <h3 className="section-title">Donation history ({history.length})</h3>
      {history.length ? (
        <ul className="list">
          {history.map((h) => (
            <li key={h.id} className="list-item">
              <div className="list-main"><strong>{formatDate(h.date)}</strong><span>{h.bankName} · {h.city}</span></div>
              <span className="muted">{h.units} unit</span>
            </li>
          ))}
        </ul>
      ) : <p className="muted">No donations recorded yet.</p>}
    </div>
  );
}
