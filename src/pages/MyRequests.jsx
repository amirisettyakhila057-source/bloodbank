import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Eye, Plus, XCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal, { ConfirmDialog } from '../components/Modal';
import Badge, { BloodGroupTag } from '../components/Badge';
import RequestForm from '../components/RequestForm';
import RequestDetails from '../components/RequestDetails';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getBloodRequests } from '../utils/localStorage';
import { cancelRequest, createRequest } from '../utils/bloodService';
import { REQUEST_STATUSES } from '../utils/constants';
import { formatDate } from '../utils/format';

export default function MyRequests() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const requests = useStore(getBloodRequests);
  const [status, setStatus] = useState('');
  // Blood Search can send a prefilled request through router state.
  const prefill = location.state?.prefill;
  const [modal, setModal] = useState(prefill ? { type: 'new', prefill } : null);
  const close = () => {
    setModal(null);
    if (prefill) navigate(location.pathname, { replace: true, state: null });
  };

  const mine = requests.filter((r) => r.userId === user.id);
  const rows = mine.filter((r) => !status || r.status === status);

  const handleCreate = (values) => {
    const result = createRequest(values, user);
    toast.result(result);
    close();
  };

  const columns = [
    { key: 'id', header: 'Request', sortable: true, render: (r) => <div className="cell-stack"><strong>{r.id}</strong><span>{formatDate(r.createdAt)}</span></div> },
    { key: 'hospitalName', header: 'Hospital / Patient', sortable: true, render: (r) => <div className="cell-stack"><strong>{r.hospitalName}</strong><span>{r.patientName}</span></div> },
    { key: 'bloodGroup', header: 'Group', render: (r) => <BloodGroupTag group={r.bloodGroup} /> },
    { key: 'units', header: 'Units', align: 'right' },
    { key: 'requiredDate', header: 'Required by', sortable: true, render: (r) => formatDate(r.requiredDate) },
    { key: 'priority', header: 'Priority', render: (r) => <Badge>{r.priority}</Badge> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge>{r.status}</Badge> },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (r) => (
        <div className="row-actions">
          <button type="button" className="icon-btn" title="View" aria-label={`View ${r.id}`} onClick={() => setModal({ type: 'view', request: r })}><Eye size={16} /></button>
          {['Pending', 'Approved'].includes(r.status) && (
            <button type="button" className="icon-btn icon-btn-danger" title="Cancel request" aria-label={`Cancel ${r.id}`} onClick={() => setModal({ type: 'cancel', request: r })}><XCircle size={16} /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My Requests"
        description="Submit blood requests and track their approval status."
        actions={<button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'new' })}><Plus size={16} aria-hidden="true" /> Request blood</button>}
      />

      <div className="tabs" role="tablist" aria-label="Filter by status">
        {['', ...REQUEST_STATUSES].map((s) => (
          <button key={s || 'all'} type="button" role="tab" aria-selected={status === s} className={`tab ${status === s ? 'is-active' : ''}`} onClick={() => setStatus(s)}>
            {s || 'All'} <span className="tab-count">{s ? mine.filter((r) => r.status === s).length : mine.length}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={rows}
          caption="My blood requests"
          emptyIcon={ClipboardList}
          emptyTitle="No blood requests found."
          emptyMessage={mine.length ? 'There are currently no requests matching your filters.' : 'You have not submitted any blood requests yet.'}
          rowClassName={(r) => (r.priority === 'Emergency' ? 'row-emergency' : '')}
        />
      </div>

      <Modal open={modal?.type === 'new'} title="New blood request" description="Fields marked * are required." onClose={close} size="lg">
        {modal?.type === 'new' && <RequestForm initialValues={{ contactNumber: user.phone, ...modal.prefill }} onSubmit={handleCreate} onCancel={close} />}
      </Modal>

      <Modal open={modal?.type === 'view'} title={`Request ${modal?.request?.id}`} onClose={close} size="lg">
        {modal?.type === 'view' && <RequestDetails request={modal.request} />}
      </Modal>

      <ConfirmDialog
        open={modal?.type === 'cancel'}
        title="Cancel this request?"
        message="Any reserved units will be released back to the blood bank."
        confirmLabel="Cancel request"
        danger
        onClose={close}
        onConfirm={() => {
          toast.result(cancelRequest(modal.request.id));
          close();
        }}
      />
    </>
  );
}
