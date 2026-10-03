import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, RotateCcw, Save } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/FormInput';
import Select from '../components/Select';
import Badge from '../components/Badge';
import { ConfirmDialog } from '../components/Modal';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { profileSchema, passwordSchema } from '../utils/validation';
import { ACCOUNT_TYPES, BLOOD_GROUPS, CITIES } from '../utils/constants';
import { formatDate, initials } from '../utils/format';
import { resetDemoData } from '../utils/localStorage';

export default function Profile() {
  const { user, isAdmin, updateProfile, changePassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const profile = useForm(
    { name: user.name, phone: user.phone || '', city: user.city || '', bloodGroup: user.bloodGroup || '', accountType: user.accountType || 'general' },
    profileSchema,
  );
  const password = useForm({ currentPassword: '', newPassword: '', confirmPassword: '' }, passwordSchema);

  const saveProfile = profile.handleSubmit((values) => {
    updateProfile({ ...values, name: values.name.trim() });
    toast.success('Profile updated successfully.');
  });

  const savePassword = password.handleSubmit((values) => {
    const result = changePassword(values.currentPassword, values.newPassword);
    if (!result.ok) {
      password.setErrors({ currentPassword: result.message });
      return;
    }
    toast.success(result.message);
    password.reset();
  });

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal details and password." />

      <div className="split-grid split-grid-wide">
        <section className="card">
          <header className="card-header"><div><h2>Personal details</h2><p>Visible to the blood bank team.</p></div></header>
          <form className="form-stack" onSubmit={saveProfile} noValidate>
            <div className="form-grid">
              <FormInput label="Full name" required {...profile.field('name')} />
              <FormInput label="Email" value={user.email} disabled hint="Email is your login ID and cannot be changed." />
              <FormInput label="Phone" type="tel" required {...profile.field('phone')} />
              <Select label="City" placeholder="Select city" options={CITIES} required {...profile.field('city')} />
              <Select label="Blood group" placeholder="Not specified" options={BLOOD_GROUPS} {...profile.field('bloodGroup')} />
              {!isAdmin && <Select label="Account type" options={ACCOUNT_TYPES} {...profile.field('accountType')} />}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary"><Save size={16} aria-hidden="true" /> Save changes</button>
            </div>
          </form>
        </section>

        <aside className="profile-side">
          <section className="card profile-card">
            <span className="avatar avatar-lg" aria-hidden="true">{initials(user.name)}</span>
            <h2>{user.name}</h2>
            <p className="muted">{user.email}</p>
            <div className="inline-badges">
              <Badge>{user.role}</Badge>
              <Badge>{user.status}</Badge>
            </div>
            <p className="field-hint">Member since {formatDate(user.createdAt)}</p>
          </section>

          <section className="card">
            <header className="card-header"><div><h2>Change password</h2></div></header>
            <form className="form-stack" onSubmit={savePassword} noValidate>
              <FormInput label="Current password" type="password" autoComplete="current-password" required {...password.field('currentPassword')} />
              <FormInput label="New password" type="password" autoComplete="new-password" required {...password.field('newPassword')} />
              <FormInput label="Confirm new password" type="password" autoComplete="new-password" required {...password.field('confirmPassword')} />
              <button type="submit" className="btn btn-secondary"><KeyRound size={16} aria-hidden="true" /> Update password</button>
            </form>
          </section>

          {isAdmin && (
            <section className="card">
              <header className="card-header"><div><h2>Demo data</h2><p>Restore the original demo dataset before a presentation.</p></div></header>
              <button type="button" className="btn btn-outline-danger" onClick={() => setConfirmReset(true)}>
                <RotateCcw size={16} aria-hidden="true" /> Reset demo data
              </button>
            </section>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        message="All donors, hospitals, inventory, requests and accounts will be restored to the original demo data. You will be signed out."
        confirmLabel="Reset data"
        danger
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          toast.info('Demo data restored. Please sign in again.');
          navigate('/login', { replace: true });
        }}
      />
    </>
  );
}
