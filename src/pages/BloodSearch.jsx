import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Search, SearchX, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Select from '../components/Select';
import FormInput from '../components/FormInput';
import EmptyState from '../components/EmptyState';
import Badge, { BloodGroupTag } from '../components/Badge';
import { useStore } from '../hooks/useStore';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { getBloodInventory } from '../utils/localStorage';
import { searchSchema } from '../utils/validation';
import { BLOOD_GROUPS, CITIES } from '../utils/constants';
import { formatDate, stockStatus } from '../utils/format';

// Red-cell compatibility: which donor groups a recipient can receive.
const COMPATIBLE = {
  'O-': ['O-'], 'O+': ['O+', 'O-'], 'A-': ['A-', 'O-'], 'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'], 'B+': ['B+', 'B-', 'O+', 'O-'], 'AB-': ['AB-', 'A-', 'B-', 'O-'], 'AB+': BLOOD_GROUPS,
};

export default function BloodSearch() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const inventory = useStore(getBloodInventory);
  const [criteria, setCriteria] = useState(null);
  const { field, handleSubmit } = useForm({ bloodGroup: '', city: '', units: '1' }, searchSchema);

  const results = criteria
    ? inventory
      .filter((r) => r.bloodGroup === criteria.bloodGroup && (!criteria.city || r.city === criteria.city))
      .sort((a, b) => b.availableUnits - a.availableUnits)
    : [];
  const units = Number(criteria?.units || 0);
  const canFulfil = results.some((r) => r.availableUnits >= units);

  const requestBlood = () => navigate('/my-requests', {
    state: { prefill: { bloodGroup: criteria.bloodGroup, units: String(units) } },
  });

  return (
    <>
      <PageHeader title="Find Blood" description="Check live blood availability across partner blood banks." />

      <form className="card search-panel" onSubmit={handleSubmit((v) => setCriteria(v))} noValidate>
        <Select label="Blood group" placeholder="Select blood group" options={BLOOD_GROUPS} required {...field('bloodGroup')} />
        <Select label="City" placeholder="All cities" options={CITIES} {...field('city')} />
        <FormInput label="Required units" type="number" min="1" required {...field('units')} />
        <button type="submit" className="btn btn-primary search-submit"><Search size={16} aria-hidden="true" /> Search</button>
      </form>

      {!criteria && (
        <div className="card">
          <EmptyState icon={Search} title="Search for blood" message="Select a blood group, an optional city and the number of units you need." />
        </div>
      )}

      {criteria && (
        <section className="card" aria-live="polite">
          <header className="card-header">
            <div>
              <h2>{results.length} blood bank(s) found</h2>
              <p>{criteria.bloodGroup} · {criteria.city || 'All cities'} · {units} unit(s) needed</p>
            </div>
            {!isAdmin && results.length > 0 && (
              <button type="button" className="btn btn-primary" onClick={requestBlood}><Send size={16} aria-hidden="true" /> Request Blood</button>
            )}
          </header>

          {results.length ? (
            <div className="result-grid">
              {results.map((r) => {
                const ok = r.availableUnits >= units;
                return (
                  <article key={r.id} className={`result-card ${ok ? '' : 'is-short'}`}>
                    <div className="result-top">
                      <BloodGroupTag group={r.bloodGroup} />
                      <Badge tone={ok ? 'success' : 'danger'}>{ok ? 'Available' : 'Insufficient'}</Badge>
                    </div>
                    <p className="result-units"><strong>{r.availableUnits}</strong> units</p>
                    <h3>{r.bankName}</h3>
                    <p className="muted">{r.city} · stock {stockStatus(r.availableUnits).toLowerCase()}</p>
                    <p className="result-contact"><Phone size={14} aria-hidden="true" /> <a href={`tel:${r.contact}`}>{r.contact}</a></p>
                    <p className="field-hint">Updated {formatDate(r.lastUpdated)}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={SearchX} title="No matching blood banks" message="Try searching all cities or another blood group." />
          )}

          {!canFulfil && results.length > 0 && (
            <div className="alert alert-warning">
              No single blood bank has {units} unit(s). Compatible groups for {criteria.bloodGroup} recipients: {COMPATIBLE[criteria.bloodGroup].join(', ')}.
            </div>
          )}
          {isAdmin && <p className="field-hint">Admins manage stock from <Link to="/admin/inventory" className="link">Blood Inventory</Link>.</p>}
        </section>
      )}
    </>
  );
}
