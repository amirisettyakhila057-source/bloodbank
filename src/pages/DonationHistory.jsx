import { Link } from 'react-router-dom';
import { CalendarDays, HeartHandshake, HeartPulse, History, Building2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import EligibilityNote from '../components/EligibilityNote';
import { BloodGroupTag } from '../components/Badge';
import { useMyDonor } from '../hooks/useMyDonor';
import { formatDate } from '../utils/format';

const columns = [
  { key: 'id', header: 'Donation ID', sortable: true },
  { key: 'date', header: 'Date', sortable: true, render: (h) => formatDate(h.date) },
  { key: 'bloodGroup', header: 'Group', render: (h) => <BloodGroupTag group={h.bloodGroup} /> },
  { key: 'units', header: 'Units', align: 'right' },
  { key: 'bankName', header: 'Blood bank', sortable: true },
  { key: 'city', header: 'City', sortable: true },
];

export default function DonationHistory() {
  const { donor, donations } = useMyDonor();

  if (!donor) {
    return (
      <>
        <PageHeader title="Donation History" />
        <div className="card">
          <EmptyState
            icon={HeartHandshake}
            title="No donor profile yet"
            message="Register as a donor to start tracking your donations."
            action={<Link to="/become-donor" className="btn btn-primary">Become a donor</Link>}
          />
        </div>
      </>
    );
  }

  const banks = new Set(donations.map((d) => d.bankId)).size;

  return (
    <>
      <PageHeader title="Donation History" description="Donations recorded by blood bank staff against your donor ID." />
      <section className="stat-grid stat-grid-3">
        <StatCard label="Total Donations" value={donations.length} icon={HeartPulse} tone="success" />
        <StatCard label="Last Donation" value={formatDate(donor.lastDonationDate)} icon={CalendarDays} tone="info" />
        <StatCard label="Blood Banks Visited" value={banks} icon={Building2} />
      </section>
      <EligibilityNote lastDonationDate={donor.lastDonationDate} />
      <div className="card">
        <DataTable
          columns={columns}
          rows={donations}
          caption="Donation history"
          emptyIcon={History}
          emptyTitle="No donations recorded yet"
          emptyMessage="Your donations will appear here once a blood bank records them."
        />
      </div>
    </>
  );
}
