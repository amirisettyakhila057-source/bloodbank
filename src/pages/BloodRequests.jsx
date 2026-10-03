import { useState } from 'react';
import { Check, ClipboardList, Eye, PackageCheck, Siren, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import SearchInput from '../components/SearchInput';
import Select from '../components/Select';
import FormInput from '../components/FormInput';
import Modal, { ConfirmDialog } from '../components/Modal';
import Badge, { BloodGroupTag } from '../components/Badge';
import RequestDetails from '../components/RequestDetails';
import { useStore } from '../hooks/useStore';
import { useToast } from '../context/ToastContext';
import { getBloodInventory, getBloodRequests } from '../utils/localStorage';
import {
  approveRequest, rejectRequest, fulfillRequest, suggestBank,
} from '../utils/bloodService';
import { isOpenEmergency } from '../utils/stats';
import { BLOOD_GROUPS, PRIORITIES, REQUEST_STATUSES } from '../utils/constants';
import { formatDate, matchesSearch } from '../utils/format';

const PRIORITY_ORDER = { Emergency: 0, Urgent: 1, Normal: 2 };

export default function BloodRequests({ emergencyOnly = false }) {
  const requests = useStore(getBloodRequests);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(emergencyOnly ? '' : 'Pending');
  const [filters, setFilters] = useState({ bloodGroup: '', priority: '' });
  const [modal, setModal] = useState(null); // { type: 'view' | 'approve' | 'reject' | 'fulfill', request }
  const close = () => setModal(null);
  const setFilter = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const scope = emergencyOnly ? requests.filter((r) => r.priority === 'Emergency') : requests;
  const rows = scope
    .filter((r) =>
      matchesSearch(r, query, ['id', 'hospitalName', 'patientName', 'doctorName'])
      && (!status || r.status === status)
      && (!filters.bloodGroup || r.bloodGroup === filters.bloodGroup)
      && (!filters.priority || r.priority === filters.priority))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.createdAt.localeCompare(a.createdAt));

  const counts = Object.fromEntries(REQUEST_STATUSES.map((s) => [s, scope.filter((r) => r.status === s).length]));
  const run = (result) => {
    toast.result(result);
    if (result.ok) close();
  };

  const columns = [
    { key: 'id', header: 'Request', sortable: true, render: (r) => <div className="cell-stack"><strong>{r.id}</strong><span>{formatDate(r.createdAt)}</span></div> },
    { key: 'hospitalName', header: 'Hospital / Patient', sortable: true, render: (r) => <div className="cell-stack"><strong>{r.hospitalName}</strong><span>{r.patientName}</span></div> },
    { key: 'bloodGroup', header: 'Group', sortable: true, render: (r) => <BloodGroupTag group={r.bloodGroup} /> },
    { key: 'units', header: 'Units', sortable: true, align: 'right' },
    { key: 'requiredDate', header: 'Required by', sortable: true, render: (r) => formatDate(r.requiredDate) },
    { key: 'priority', header: 'Priority', sortable: true, sortValue: (r) => PRIORITY_ORDER[r.priority], render: (r) => <Badge>{r.priority}</Badge> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge>{r.status}</Badge> },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (r) => (
        <div className="row-actions">
          <button type="button" className="icon-btn" title="View" aria-label={`View ${r.id}`} onClick={() => setModal({ type: 'view', request: r })}><Eye size={16} /></button>
          {r.status === 'Pending' && (
            <>
              <button type="button" className="btn btn-success btn-sm" onClick={() => setModal({ type: 'approve', request: r })}><Check size={14} aria-hidden="true" /> Approve</button>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setModal({ type: 'reject', request: r })}><X size={14} aria-hidden="true" /> Reject</button>
            </>
          )}
          {r.status === 'Approved' && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'fulfill', request: r })}><PackageCheck size={14} aria-hidden="true" /> Fulfil</button>
          )}
        </div>
      ),
    },
  ];

  const openEmergencies = requests.filter(isOpenEmergency).length;

  return (
    <>
      <PageHeader
        title={emergencyOnly ? 'Emergency Requests' : 'Blood Requests'}
        description={emergencyOnly
          ? `${openEmergencies} emergency request(s) currently open. Handle these first.`
          : 'Review, approve and fulfil blood requests from hospitals and users.'}
      />

      <div className="tabs" role="tablist" aria-label="Filter by status">
        {['', ...REQUEST_STATUSES].map((s) => (
          <button key={s || 'all'} type="button" role="tab" aria-selected={status === s} className={`tab ${status === s ? 'is-active' : ''}`} onClick={() => setStatus(s)}>
            {s || 'All'} <span className="tab-count">{s ? counts[s] : scope.length}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search request ID, hospital, patient…" label="Search requests" />
          <div className="toolbar-filters">
            <Select aria-label="Filter by blood group" name="bloodGroup" value={filters.bloodGroup} onChange={setFilter} placeholder="All groups" options={BLOOD_GROUPS} />
            {!emergencyOnly && <Select aria-label="Filter by priority" name="priority" value={filters.priority} onChange={setFilter} placeholder="All priorities" options={PRIORITIES} />}
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          caption="Blood requests"
          emptyIcon={emergencyOnly ? Siren : ClipboardList}
          emptyTitle={emergencyOnly ? 'No emergency requests found.' : 'No blood requests found.'}
          emptyMessage="There are currently no requests matching your filters."
          rowClassName={(r) => (r.priority === 'Emergency' ? 'row-emergency' : '')}
        />
      </div>

      <Modal open={modal?.type === 'view'} title={`Request ${modal?.request?.id}`} onClose={close} size="lg">
        {modal?.type === 'view' && <RequestDetails request={modal.request} />}
      </Modal>

      {modal?.type === 'approve' && (
        <ApproveDialog request={modal.request} onClose={close} onApprove={(bankId) => run(approveRequest(modal.request.id, bankId))} />
      )}

      {modal?.type === 'reject' && (
        <RejectDialog request={modal.request} onClose={close} onReject={(note) => run(rejectRequest(modal.request.id, note))} />
      )}

      <ConfirmDialog
        open={modal?.type === 'fulfill'}
        title="Mark as fulfilled?"
        message={modal?.request && `Confirm that ${modal.request.units} unit(s) of ${modal.request.bloodGroup} from ${modal.request.bankName} were issued to ${modal.request.hospitalName}.`}
        confirmLabel="Mark fulfilled"
        onClose={close}
        onConfirm={() => run(fulfillRequest(modal.request.id))}
      />
    </>
  );
}

function ApproveDialog({ request, onClose, onApprove }) {
  const inventory = useStore(getBloodInventory);
  const options = inventory.filter((r) => r.bloodGroup === request.bloodGroup);
  const [bankId, setBankId] = useState(suggestBank(request.bloodGroup, request.units)?.bankId || '');
  const enough = options.find((o) => o.bankId === bankId)?.availableUnits >= request.units;

  return (
    <Modal
      open
      title={`Approve ${request.id}`}
      description={`${request.units} unit(s) of ${request.bloodGroup} for ${request.hospitalName}`}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-success" disabled={!enough} onClick={() => onApprove(bankId)}>Approve & reserve</button>
        </>
      )}
    >
      <div className="form-stack">
        <p className="muted">Choose the blood bank that will supply this request. The units will be reserved until fulfilment.</p>
        <div className="choice-list" role="radiogroup" aria-label="Blood bank">
          {options.map((o) => {
            const ok = o.availableUnits >= request.units;
            return (
              <label key={o.id} className={`choice ${bankId === o.bankId ? 'is-selected' : ''} ${ok ? '' : 'is-disabled'}`}>
                <input type="radio" name="bank" value={o.bankId} checked={bankId === o.bankId} disabled={!ok} onChange={() => setBankId(o.bankId)} />
                <span className="choice-main"><strong>{o.bankName}</strong><span>{o.city}</span></span>
                <span className={ok ? 'choice-meta' : 'choice-meta text-danger'}>{o.availableUnits} available</span>
              </label>
            );
          })}
        </div>
        {!options.some((o) => o.availableUnits >= request.units) && (
          <div className="alert alert-error">No blood bank currently has {request.units} unit(s) of {request.bloodGroup}. Add stock or reject the request.</div>
        )}
      </div>
    </Modal>
  );
}

function RejectDialog({ request, onClose, onReject }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (note.trim().length < 5) {
      setError('Please give a short reason (at least 5 characters)');
      return;
    }
    onReject(note.trim());
  };
  return (
    <Modal
      open
      title={`Reject ${request.id}`}
      description="The requester will see this reason."
      onClose={onClose}
      size="sm"
      footer={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={submit}>Reject request</button>
        </>
      )}
    >
      <FormInput label="Reason for rejection" as="textarea" rows={3} required value={note} error={error} onChange={(e) => { setNote(e.target.value); setError(''); }} />
    </Modal>
  );
}
