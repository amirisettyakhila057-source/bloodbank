import { Link } from 'react-router-dom';
import {
  Users, UserCheck, Building2, Clock, Siren, Droplets, PackageCheck, AlertTriangle, ArrowRight,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Badge, { BloodGroupTag } from '../components/Badge';
import EmptyState from '../components/EmptyState';
import {
  DonorGroupChart, MonthlyDonationsChart, InventoryChart, RequestStatusChart, PriorityChart,
} from '../components/Charts';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../context/AuthContext';
import {
  getDonors, getHospitals, getBloodInventory, getBloodRequests, getDonationHistory,
} from '../utils/localStorage';
import {
  systemSummary, donorsByGroup, donationsByMonth, inventoryByGroup, requestsByStatus,
  requestsByPriority, isOpenEmergency, lowStockRows,
} from '../utils/stats';
import { formatDate, formatNumber, stockStatus } from '../utils/format';

export default function AdminDashboard() {
  const { user } = useAuth();
  const donors = useStore(getDonors);
  const hospitals = useStore(getHospitals);
  const inventory = useStore(getBloodInventory);
  const requests = useStore(getBloodRequests);
  const history = useStore(getDonationHistory);

  const s = systemSummary({ donors, hospitals, inventory, requests, history });
  const emergencies = requests.filter(isOpenEmergency);
  const lowStock = lowStockRows(inventory).sort((a, b) => a.availableUnits - b.availableUnits).slice(0, 6);

  return (
    <>
      <PageHeader
        title={`Good day, ${user.name}`}
        description="Overview of donors, blood stock and requests across the network."
        actions={<Link to="/admin/requests" className="btn btn-primary">Review requests <ArrowRight size={16} aria-hidden="true" /></Link>}
      />

      <section className="stat-grid" aria-label="Key statistics">
        <StatCard label="Total Donors" value={formatNumber(s.totalDonors)} icon={Users} />
        <StatCard label="Active Donors" value={formatNumber(s.activeDonors)} icon={UserCheck} tone="success" hint={`${s.totalDonors - s.activeDonors} inactive`} />
        <StatCard label="Hospitals" value={formatNumber(s.totalHospitals)} icon={Building2} tone="info" hint={`${s.activeHospitals} active`} />
        <StatCard label="Pending Requests" value={formatNumber(s.pendingRequests)} icon={Clock} tone="warning" hint={`${s.totalRequests} total requests`} />
        <StatCard label="Emergency Requests" value={formatNumber(s.emergencyOpen)} icon={Siren} tone="danger" hint="Open (pending or approved)" />
        <StatCard label="Total Blood Units" value={formatNumber(s.totalUnits)} icon={Droplets} hint={`${formatNumber(s.reservedUnits)} reserved`} />
        <StatCard label="Available Units" value={formatNumber(s.availableUnits)} icon={PackageCheck} tone="success" />
        <StatCard label="Low Stock Alerts" value={formatNumber(s.lowStock)} icon={AlertTriangle} tone="warning" hint="Bank × blood group entries" />
      </section>

      <section className="split-grid">
        <div className="card">
          <header className="card-header">
            <div>
              <h2>Emergency queue</h2>
              <p>Open emergency requests needing attention</p>
            </div>
            <Link to="/admin/emergency" className="link">View all</Link>
          </header>
          {emergencies.length ? (
            <ul className="list">
              {emergencies.map((r) => (
                <li key={r.id} className="list-item emergency-row">
                  <BloodGroupTag group={r.bloodGroup} />
                  <div className="list-main">
                    <strong>{r.hospitalName}</strong>
                    <span>{r.units} unit(s) · needed by {formatDate(r.requiredDate)} · {r.id}</span>
                  </div>
                  <Badge>{r.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Siren} title="No open emergencies" message="All emergency requests have been handled." />
          )}
        </div>

        <div className="card">
          <header className="card-header">
            <div>
              <h2>Low stock alerts</h2>
              <p>Lowest available units by blood bank</p>
            </div>
            <Link to="/admin/inventory" className="link">Manage stock</Link>
          </header>
          {lowStock.length ? (
            <ul className="list">
              {lowStock.map((r) => (
                <li key={r.id} className="list-item">
                  <BloodGroupTag group={r.bloodGroup} />
                  <div className="list-main">
                    <strong>{r.bankName}</strong>
                    <span>{r.availableUnits} available · {r.city}</span>
                  </div>
                  <Badge>{stockStatus(r.availableUnits)}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={PackageCheck} title="Stock levels healthy" message="No blood group is running low." />
          )}
        </div>
      </section>

      <section className="chart-grid" aria-label="Charts">
        <InventoryChart data={inventoryByGroup(inventory)} />
        <MonthlyDonationsChart data={donationsByMonth(history)} />
        <DonorGroupChart data={donorsByGroup(donors)} />
        <RequestStatusChart data={requestsByStatus(requests)} />
        <PriorityChart data={requestsByPriority(requests)} />
      </section>
    </>
  );
}
