import { CalendarCheck, CalendarClock } from 'lucide-react';
import { donationEligibility } from '../utils/bloodService';
import { formatDate } from '../utils/format';

export default function EligibilityNote({ lastDonationDate }) {
  const { eligible, nextDate, daysLeft } = donationEligibility(lastDonationDate);
  return eligible ? (
    <div className="alert alert-success"><CalendarCheck size={18} aria-hidden="true" /> Eligible to donate today.</div>
  ) : (
    <div className="alert alert-warning">
      <CalendarClock size={18} aria-hidden="true" />
      <span>Next donation possible on <strong>{formatDate(nextDate)}</strong> ({daysLeft} days to go).</span>
    </div>
  );
}
