export default function StatCard({ label, value, icon: Icon, tone = 'primary', hint }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon tone-${tone}`} aria-hidden="true">
        <Icon size={20} />
      </div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {hint && <p className="stat-hint">{hint}</p>}
      </div>
    </article>
  );
}
