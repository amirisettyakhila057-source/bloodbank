import { useState } from 'react';
import { Droplets, PackagePlus, Pencil } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import SearchInput from '../components/SearchInput';
import Select from '../components/Select';
import FormInput from '../components/FormInput';
import Modal from '../components/Modal';
import Badge, { BloodGroupTag } from '../components/Badge';
import { useStore } from '../hooks/useStore';
import { useForm } from '../hooks/useForm';
import { useToast } from '../context/ToastContext';
import { getBloodInventory } from '../utils/localStorage';
import { addStock, updateStock } from '../utils/bloodService';
import { inventoryByGroup } from '../utils/stats';
import { stockSchema, stockUpdateSchema } from '../utils/validation';
import { BLOOD_BANKS, BLOOD_GROUPS, STOCK_THRESHOLDS } from '../utils/constants';
import { formatDate, matchesSearch, stockStatus } from '../utils/format';

const STOCK_STATUSES = ['Available', 'Low Stock', 'Critical', 'Out of Stock'];
const BANK_OPTIONS = BLOOD_BANKS.map((b) => ({ value: b.id, label: `${b.name} · ${b.city}` }));

export default function BloodInventory() {
  const inventory = useStore(getBloodInventory);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ bloodGroup: '', bankId: '', status: '' });
  const [modal, setModal] = useState(null); // { type: 'add' } | { type: 'edit', row }
  const close = () => setModal(null);
  const setFilter = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const rows = inventory.filter((r) =>
    matchesSearch(r, query, ['bloodGroup', 'bankName', 'city'])
    && (!filters.bloodGroup || r.bloodGroup === filters.bloodGroup)
    && (!filters.bankId || r.bankId === filters.bankId)
    && (!filters.status || stockStatus(r.availableUnits) === filters.status));

  const columns = [
    { key: 'bloodGroup', header: 'Blood group', sortable: true, render: (r) => <BloodGroupTag group={r.bloodGroup} /> },
    { key: 'bankName', header: 'Blood bank', sortable: true, render: (r) => <div className="cell-stack"><strong>{r.bankName}</strong><span>{r.city}</span></div> },
    { key: 'availableUnits', header: 'Available', sortable: true, align: 'right' },
    { key: 'reservedUnits', header: 'Reserved', sortable: true, align: 'right' },
    { key: 'total', header: 'Total', sortable: true, align: 'right', sortValue: (r) => r.availableUnits + r.reservedUnits, render: (r) => <strong>{r.availableUnits + r.reservedUnits}</strong> },
    { key: 'status', header: 'Status', sortable: true, sortValue: (r) => r.availableUnits, render: (r) => <Badge>{stockStatus(r.availableUnits)}</Badge> },
    { key: 'lastUpdated', header: 'Last updated', sortable: true, render: (r) => formatDate(r.lastUpdated) },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (r) => (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'edit', row: r })} aria-label={`Update ${r.bloodGroup} stock at ${r.bankName}`}>
          <Pencil size={14} aria-hidden="true" /> Update
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Blood Inventory"
        description={`Stock per blood bank. Critical ≤ ${STOCK_THRESHOLDS.critical} units, low stock ≤ ${STOCK_THRESHOLDS.low} units.`}
        actions={<button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'add' })}><PackagePlus size={16} aria-hidden="true" /> Add stock</button>}
      />

      <section className="group-grid" aria-label="Units by blood group">
        {inventoryByGroup(inventory).map((g) => (
          <button
            type="button"
            key={g.group}
            className={`group-tile ${filters.bloodGroup === g.group ? 'is-active' : ''}`}
            onClick={() => setFilters((f) => ({ ...f, bloodGroup: f.bloodGroup === g.group ? '' : g.group }))}
            aria-pressed={filters.bloodGroup === g.group}
          >
            <span className="group-tile-name">{g.group}</span>
            <strong>{g.available}</strong>
            <span>available</span>
            <span>{g.reserved} reserved</span>
          </button>
        ))}
      </section>

      <div className="card">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search blood bank, city or group…" label="Search inventory" />
          <div className="toolbar-filters">
            <Select aria-label="Filter by blood group" name="bloodGroup" value={filters.bloodGroup} onChange={setFilter} placeholder="All groups" options={BLOOD_GROUPS} />
            <Select aria-label="Filter by blood bank" name="bankId" value={filters.bankId} onChange={setFilter} placeholder="All blood banks" options={BANK_OPTIONS} />
            <Select aria-label="Filter by stock status" name="status" value={filters.status} onChange={setFilter} placeholder="All statuses" options={STOCK_STATUSES} />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          caption="Blood inventory"
          emptyIcon={Droplets}
          emptyTitle="No stock entries found"
          emptyMessage="There are currently no inventory entries matching your filters."
        />
      </div>

      <Modal open={modal?.type === 'add'} title="Add blood stock" description="Add newly collected or received units." onClose={close} size="sm">
        <AddStockForm
          initialGroup={filters.bloodGroup}
          onCancel={close}
          onDone={(result) => { toast.result(result); close(); }}
        />
      </Modal>

      <Modal
        open={modal?.type === 'edit'}
        title={`Update ${modal?.row?.bloodGroup} stock`}
        description={modal?.row?.bankName}
        onClose={close}
        size="sm"
      >
        {modal?.type === 'edit' && (
          <UpdateStockForm row={modal.row} onCancel={close} onDone={(result) => { toast.result(result); close(); }} />
        )}
      </Modal>
    </>
  );
}

function AddStockForm({ initialGroup, onCancel, onDone }) {
  const { field, handleSubmit } = useForm({ bankId: BLOOD_BANKS[0].id, bloodGroup: initialGroup || '', units: '' }, stockSchema);
  return (
    <form className="form-stack" onSubmit={handleSubmit((v) => onDone(addStock(v.bankId, v.bloodGroup, Number(v.units))))} noValidate>
      <Select label="Blood bank" options={BANK_OPTIONS} required {...field('bankId')} />
      <Select label="Blood group" placeholder="Select blood group" options={BLOOD_GROUPS} required {...field('bloodGroup')} />
      <FormInput label="Units to add" type="number" min="1" required {...field('units')} />
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Add stock</button>
      </div>
    </form>
  );
}

function UpdateStockForm({ row, onCancel, onDone }) {
  const { field, values, handleSubmit } = useForm(
    { availableUnits: String(row.availableUnits), reservedUnits: String(row.reservedUnits) },
    stockUpdateSchema,
  );
  const preview = Number(values.availableUnits) || 0;
  return (
    <form className="form-stack" onSubmit={handleSubmit((v) => onDone(updateStock(row.id, v.availableUnits, v.reservedUnits)))} noValidate>
      <div className="form-grid">
        <FormInput label="Available units" type="number" min="0" required {...field('availableUnits')} />
        <FormInput label="Reserved units" type="number" min="0" required {...field('reservedUnits')} />
      </div>
      <p className="muted">New status: <Badge>{stockStatus(preview)}</Badge></p>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save stock</button>
      </div>
    </form>
  );
}
