import Badge, { BloodGroupTag } from './Badge';
import { formatDate, formatDateTime } from '../utils/format';

const STEPS = ['Pending', 'Approved', 'Fulfilled'];

/** Read-only request summary with a simple status timeline. */
export default function RequestDetails({ request: r }) {
  const closed = ['Rejected', 'Cancelled'].includes(r.status);
  const reached = STEPS.indexOf(r.status);
  return (
    <div className="form-stack">
      <ol className="timeline" aria-label="Request progress">
        {STEPS.map((step, i) => (
          <li key={step} className={!closed && i <= reached ? 'is-done' : ''}>{step}</li>
        ))}
        {closed && <li className="is-closed">{r.status}</li>}
      </ol>
      <dl className="detail-grid">
        <div><dt>Blood group</dt><dd><BloodGroupTag group={r.bloodGroup} /> · {r.units} unit(s)</dd></div>
        <div><dt>Priority / Status</dt><dd className="inline-badges"><Badge>{r.priority}</Badge><Badge>{r.status}</Badge></dd></div>
        <div><dt>Hospital</dt><dd>{r.hospitalName}</dd></div>
        <div><dt>Patient</dt><dd>{r.patientName}</dd></div>
        <div><dt>Doctor</dt><dd>{r.doctorName}</dd></div>
        <div><dt>Contact</dt><dd>{r.contactNumber}</dd></div>
        <div><dt>Required by</dt><dd>{formatDate(r.requiredDate)}</dd></div>
        <div><dt>Allocated from</dt><dd>{r.bankName || '—'}</dd></div>
        <div className="span-2"><dt>Reason</dt><dd>{r.reason}</dd></div>
        {r.notes && <div className="span-2"><dt>Notes</dt><dd>{r.notes}</dd></div>}
        {r.adminNote && <div className="span-2"><dt>Blood bank note</dt><dd>{r.adminNote}</dd></div>}
        <div><dt>Submitted</dt><dd>{formatDateTime(r.createdAt)}</dd></div>
        <div><dt>Last updated</dt><dd>{formatDateTime(r.updatedAt)}</dd></div>
      </dl>
    </div>
  );
}
