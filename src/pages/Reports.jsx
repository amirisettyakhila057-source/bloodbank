import { Printer, HeartPulse, Droplets, ClipboardList, CheckCircle2, Siren, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Badge, { BloodGroupTag } from '../components/Badge';
import {
  DonorGroupChart, MonthlyDonationsChart, InventoryChart, RequestStatusChart, PriorityChart,
} from '../components/Charts';
import { useStore } from '../hooks/useStore';
import {
  getDonors, getHospitals, getBloodInventory, getBloodRequests, getDonationHistory,
} from '../utils/localStorage';
import {
  systemSummary, donorsByGroup, donationsByMonth, inventoryByGroup, requestsByStatus, requestsByPriority,
} from '../utils/stats';
import { CITIES, GENDERS } from '../utils/constants';
import { formatDate, formatNumber, stockStatus, todayISO } from '../utils/format';

export default function Reports() {
  const donors = useStore(getDonors);
  const hospitals = useStore(getHospitals);
  const inventory = useStore(getBloodInventory);
  const requests = useStore(getBloodRequests);
  const history = useStore(getDonationHistory);

  const s = systemSummary({ donors, hospitals, inventory, requests, history });
  const byGroup = inventoryByGroup(inventory);
  const fulfilmentRate = s.totalRequests ? Math.round((s.fulfilledRequests / s.totalRequests) * 100) : 0;

  const donorStats = [
    ...GENDERS.map((g) => [g, donors.filter((d) => d.gender === g).length]),
    ...CITIES.map((c) => [c, donors.filter((d) => d.city === c).length]),
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description={`System summary generated on ${formatDate(todayISO())}.`}
        actions={<button type="button" className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print report</button>}
      />

      <section className="stat-grid stat-grid-3" aria-label="Summary">
        <StatCard label="Total Donations" value={formatNumber(s.totalDonations)} icon={HeartPulse} tone="success" hint={`${history.length} donation records`} />
        <StatCard label="Blood Inventory" value={`${formatNumber(s.totalUnits)} units`} icon={Droplets} hint={`${formatNumber(s.availableUnits)} available · ${formatNumber(s.reservedUnits)} reserved`} />
        <StatCard label="Blood Requests" value={formatNumber(s.totalRequests)} icon={ClipboardList} tone="info" hint={`${s.pendingRequests} pending`} />
        <StatCard label="Fulfilled Requests" value={formatNumber(s.fulfilledRequests)} icon={CheckCircle2} tone="success" hint={`${fulfilmentRate}% fulfilment rate`} />
        <StatCard label="Emergency Requests" value={formatNumber(s.emergencyTotal)} icon={Siren} tone="danger" hint={`${s.emergencyOpen} still open`} />
        <StatCard label="Donors" value={formatNumber(s.totalDonors)} icon={Users} tone="warning" hint={`${s.activeDonors} active · ${s.totalDonors - s.activeDonors} inactive`} />
      </section>

      <section className="chart-grid">
        <MonthlyDonationsChart data={donationsByMonth(history)} />
        <InventoryChart data={byGroup} />
        <RequestStatusChart data={requestsByStatus(requests)} />
        <PriorityChart data={requestsByPriority(requests)} />
      </section>

      <section className="split-grid">
        <div className="card">
          <header className="card-header"><div><h2>Inventory by blood group</h2><p>Totals across all blood banks</p></div></header>
          <div className="table-scroll">
            <table className="table table-compact">
              <thead><tr><th>Group</th><th className="text-right">Available</th><th className="text-right">Reserved</th><th className="text-right">Total</th><th>Lowest bank status</th></tr></thead>
              <tbody>
                {byGroup.map((g) => {
                  const lowest = Math.min(...inventory.filter((r) => r.bloodGroup === g.group).map((r) => r.availableUnits));
                  return (
                    <tr key={g.group}>
                      <td><BloodGroupTag group={g.group} /></td>
                      <td className="text-right">{g.available}</td>
                      <td className="text-right">{g.reserved}</td>
                      <td className="text-right"><strong>{g.total}</strong></td>
                      <td><Badge>{stockStatus(lowest)}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <header className="card-header"><div><h2>Donor statistics</h2><p>Registered donors by gender and city</p></div></header>
          <ul className="bar-list">
            {donorStats.map(([label, count]) => (
              <li key={label}>
                <span>{label}</span>
                <span className="bar-track" aria-hidden="true"><span style={{ width: `${s.totalDonors ? (count / s.totalDonors) * 100 : 0}%` }} /></span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DonorGroupChart data={donorsByGroup(donors)} />
    </>
  );
}
