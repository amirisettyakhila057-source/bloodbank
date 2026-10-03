import { Link } from 'react-router-dom';
import {
  Droplet, CalendarDays, HeartPulse, ClipboardList, Search, HeartHandshake, Siren, ArrowRight,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Badge, { BloodGroupTag } from '../components/Badge';
import EmptyState from '../components/EmptyState';
import EligibilityNote from '../components/EligibilityNote';
import { useStore } from '../hooks/useStore';
import { useMyDonor } from '../hooks/useMyDonor';
import { useAuth } from '../context/AuthContext';
import { getBloodInventory, getBloodRequests } from '../utils/localStorage';
import { inventoryByGroup, isOpenEmergency } from '../utils/stats';
import { formatDate } from '../utils/format';

export default function UserDashboard() {
  const { user } = useAuth();
  const { donor, donations } = useMyDonor();
  const requests = useStore(getBloodRequests);
  const inventory = useStore(getBloodInventory);

  const myRequests = requests.filter((r) => r.userId === user.id);
  const openRequests = myRequests.filter((r) => ['Pending', 'Approved'].includes(r.status)).length;
  const emergencies = requests.filter(isOpenEmergency);
  const bloodGroup = donor?.bloodGroup || user.bloodGroup;
  const firstName = user.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Your donor profile, blood requests and live availability at a glance."
        actions={(
          <>
            <Link to="/search" className="btn btn-secondary"><Search size={16} aria-hidden="true" /> Find blood</Link>
            <Link to="/my-requests" className="btn btn-primary"><ClipboardList size={16} aria-hidden="true" /> My requests</Link>
          </>
        )}
      />

      <section className="stat-grid" aria-label="Your summary">
        <StatCard label="Your Blood Group" value={bloodGroup || '—'} icon={Droplet} hint={bloodGroup ? 'From your donor profile' : 'Register as a donor to add it'} />
        <StatCard label="Last Donation" value={formatDate(donor?.lastDonationDate)} icon={CalendarDays} tone="info" />
        <StatCard label="Total Donations" value={donations.length} icon={HeartPulse} tone="success" hint={donations.length ? `${donations.length} unit(s) donated` : 'No donations yet'} />
        <StatCard label="Blood Requests" value={myRequests.length} icon={ClipboardList} tone="warning" hint={`${openRequests} open`} />
      </section>

      <section className="split-grid">
        <div className="card">
          <header className="card-header">
            <div><h2>Profile</h2><p>{user.email}</p></div>
            <Link to="/profile" className="link">Edit</Link>
          </header>
          {donor ? (
            <div className="form-stack">
              <dl className="detail-grid">
                <div><dt>Donor ID</dt><dd>{donor.id}</dd></div>
                <div><dt>Status</dt><dd><Badge>{donor.status}</Badge></dd></div>
                <div><dt>Phone</dt><dd>{donor.phone}</dd></div>
                <div><dt>City</dt><dd>{donor.city}</dd></div>
              </dl>
              <EligibilityNote lastDonationDate={donor.lastDonationDate} />
            </div>
          ) : (
            <EmptyState
              icon={HeartHandshake}
              title="You are not registered as a donor"
              message="One donation can help save up to three lives."
              action={<Link to="/become-donor" className="btn btn-primary">Become a donor</Link>}
            />
          )}
        </div>

        <div className="card">
          <header className="card-header">
            <div><h2>Recent requests</h2><p>Status of your latest blood requests</p></div>
            <Link to="/my-requests" className="link">View all</Link>
          </header>
          {myRequests.length ? (
            <ul className="list">
              {myRequests.slice(0, 4).map((r) => (
                <li key={r.id} className={`list-item ${r.priority === 'Emergency' ? 'emergency-row' : ''}`}>
                  <BloodGroupTag group={r.bloodGroup} />
                  <div className="list-main">
                    <strong>{r.hospitalName}</strong>
                    <span>{r.id} · {r.units} unit(s) · by {formatDate(r.requiredDate)}</span>
                  </div>
                  <Badge>{r.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={ClipboardList} title="No blood requests yet" message="Requests you submit will appear here." />
          )}
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <div><h2>Available blood</h2><p>Total available units across partner blood banks</p></div>
          <Link to="/search" className="link">Search by city</Link>
        </header>
        <div className="group-grid group-grid-compact">
          {inventoryByGroup(inventory).map((g) => (
            <div key={g.group} className={`group-tile ${g.group === bloodGroup ? 'is-active' : ''}`}>
              <span className="group-tile-name">{g.group}</span>
              <strong>{g.available}</strong>
              <span>units</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <div><h2>Emergency requests</h2><p>Hospitals urgently looking for blood right now</p></div>
        </header>
        {emergencies.length ? (
          <ul className="list">
            {emergencies.map((r) => (
              <li key={r.id} className="list-item emergency-row">
                <Siren size={18} className="text-danger" aria-hidden="true" />
                <BloodGroupTag group={r.bloodGroup} />
                <div className="list-main">
                  <strong>{r.hospitalName}</strong>
                  <span>{r.units} unit(s) needed by {formatDate(r.requiredDate)}</span>
                </div>
                {bloodGroup === r.bloodGroup && donor?.status === 'Active' && (
                  <span className="badge badge-info">Matches your group</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Siren} title="No emergency requests" message="There are no open emergency requests at the moment." />
        )}
        {emergencies.length > 0 && !donor && (
          <Link to="/become-donor" className="link inline-link">Register as a donor to help <ArrowRight size={14} aria-hidden="true" /></Link>
        )}
      </section>
    </>
  );
}
