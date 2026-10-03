import { useState } from 'react';
import { Power, Trash2, UserCog } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import SearchInput from '../components/SearchInput';
import Select from '../components/Select';
import { ConfirmDialog } from '../components/Modal';
import Badge from '../components/Badge';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUsers, saveUsers, getBloodRequests } from '../utils/localStorage';
import { ACCOUNT_TYPES } from '../utils/constants';
import { formatDate, initials, matchesSearch } from '../utils/format';

const TYPE_LABELS = Object.fromEntries(ACCOUNT_TYPES.map((t) => [t.value, t.label]));

export default function Users() {
  const { user: me } = useAuth();
  const users = useStore(getUsers);
  const requests = useStore(getBloodRequests);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [deleting, setDeleting] = useState(null);

  const rows = users.filter((u) => matchesSearch(u, query, ['name', 'email', 'phone']) && (!role || u.role === role));

  const toggleStatus = (u) => {
    const status = u.status === 'Active' ? 'Disabled' : 'Active';
    saveUsers(users.map((x) => (x.id === u.id ? { ...x, status } : x)));
    toast.success(`${u.name}'s account is now ${status.toLowerCase()}.`);
  };

  const columns = [
    {
      key: 'name', header: 'User', sortable: true,
      render: (u) => (
        <div className="user-cell">
          <span className="avatar avatar-sm" aria-hidden="true">{initials(u.name)}</span>
          <div className="cell-stack"><strong>{u.name}{u.id === me.id && ' (you)'}</strong><span>{u.email}</span></div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone' },
    { key: 'role', header: 'Role', sortable: true, render: (u) => <Badge>{u.role}</Badge> },
    { key: 'accountType', header: 'Account type', render: (u) => (u.role === 'admin' ? 'Administrator' : TYPE_LABELS[u.accountType] || '—') },
    { key: 'requests', header: 'Requests', align: 'right', sortValue: (u) => requests.filter((r) => r.userId === u.id).length, sortable: true, render: (u) => requests.filter((r) => r.userId === u.id).length },
    { key: 'createdAt', header: 'Joined', sortable: true, render: (u) => formatDate(u.createdAt) },
    { key: 'status', header: 'Status', sortable: true, render: (u) => <Badge>{u.status}</Badge> },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (u) => (u.id === me.id ? <span className="muted">—</span> : (
        <div className="row-actions">
          <button type="button" className="icon-btn" title={u.status === 'Active' ? 'Disable account' : 'Enable account'} aria-label={`Toggle account status for ${u.name}`} onClick={() => toggleStatus(u)}><Power size={16} /></button>
          <button type="button" className="icon-btn icon-btn-danger" title="Delete account" aria-label={`Delete ${u.name}`} onClick={() => setDeleting(u)}><Trash2 size={16} /></button>
        </div>
      )),
    },
  ];

  return (
    <>
      <PageHeader title="Users" description="Accounts that can sign in. Disabled users cannot log in." />
      <div className="card">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search name, email, phone…" label="Search users" />
          <div className="toolbar-filters">
            <Select aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="All roles" options={[{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]} />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          caption="Users"
          emptyIcon={UserCog}
          emptyTitle="No users found"
          emptyMessage="There are currently no users matching your search."
        />
      </div>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete user account?"
        message={`${deleting?.name} will no longer be able to sign in. Their requests remain in the system.`}
        confirmLabel="Delete account"
        danger
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          saveUsers(users.filter((u) => u.id !== deleting.id));
          toast.success('User account deleted.');
          setDeleting(null);
        }}
      />
    </>
  );
}
