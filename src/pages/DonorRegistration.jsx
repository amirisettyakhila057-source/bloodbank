import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HeartHandshake } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DonorForm from '../components/DonorForm';
import Badge, { BloodGroupTag } from '../components/Badge';
import EligibilityNote from '../components/EligibilityNote';
import { useMyDonor } from '../hooks/useMyDonor';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { saveDonor } from '../utils/bloodService';
import { formatDate } from '../utils/format';

const ELIGIBILITY = [
  'Aged between 18 and 65 years',
  'Weight of at least 50 kg and in good health',
  'At least 90 days since your last whole-blood donation',
  'No fever, infection or recent major surgery',
];

export default function DonorRegistration() {
  const { user, updateProfile } = useAuth();
  const { donor } = useMyDonor();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  const handleSubmit = (values) => {
    const result = saveDonor(values, { id: donor?.id, userId: user.id });
    if (result.ok) {
      updateProfile({ bloodGroup: values.bloodGroup, city: values.city, phone: values.phone });
      toast.success(result.message);
      setJustRegistered(!donor);
      setEditing(false);
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const showForm = !donor || editing;

  return (
    <>
      <PageHeader title="Become a Donor" description="Register once and help hospitals find compatible donors quickly." />

      <div className="split-grid split-grid-wide">
        <section className="card">
          {justRegistered && donor && !editing && (
            <div className="alert alert-success" role="status">
              <CheckCircle2 size={18} aria-hidden="true" /> Donor registration completed successfully.
            </div>
          )}

          {showForm ? (
            <>
              <header className="card-header">
                <div>
                  <h2>{donor ? 'Update donor details' : 'Donor registration'}</h2>
                  <p>Fields marked * are required.</p>
                </div>
              </header>
              <DonorForm
                initialValues={donor || { fullName: user.name, email: user.email, phone: user.phone, city: user.city }}
                onSubmit={handleSubmit}
                onCancel={donor ? () => setEditing(false) : undefined}
                submitLabel={donor ? 'Save changes' : 'Register as donor'}
              />
            </>
          ) : (
            <>
              <header className="card-header">
                <div><h2>You are a registered donor</h2><p>Donor ID {donor.id} · since {formatDate(donor.registeredAt)}</p></div>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>Edit details</button>
              </header>
              <div className="form-stack">
                <dl className="detail-grid">
                  <div><dt>Blood group</dt><dd><BloodGroupTag group={donor.bloodGroup} /></dd></div>
                  <div><dt>Status</dt><dd><Badge>{donor.status}</Badge></dd></div>
                  <div><dt>Phone</dt><dd>{donor.phone}</dd></div>
                  <div><dt>Emergency contact</dt><dd>{donor.emergencyContact}</dd></div>
                  <div><dt>City</dt><dd>{donor.city}</dd></div>
                  <div><dt>Last donation</dt><dd>{formatDate(donor.lastDonationDate)}</dd></div>
                </dl>
                <EligibilityNote lastDonationDate={donor.lastDonationDate} />
                <Link to="/donation-history" className="link">View donation history</Link>
              </div>
            </>
          )}
        </section>

        <aside className="card info-card">
          <div className="info-icon" aria-hidden="true"><HeartHandshake size={22} /></div>
          <h2>Who can donate?</h2>
          <ul className="check-list">
            {ELIGIBILITY.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="field-hint">General guidance for this demo. Final eligibility is confirmed by medical staff at the blood bank.</p>
        </aside>
      </div>
    </>
  );
}
