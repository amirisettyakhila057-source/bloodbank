import { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { BarChart3, Table2 } from 'lucide-react';

// Validated categorical palette (fixed order) + reserved status colours.
const SERIES = { blue: '#2a78d6', orange: '#eb6834', red: '#c62828', gray: '#9aa1ac' };
const STATUS_COLORS = {
  Pending: '#d18a00', Approved: '#2a78d6', Rejected: '#c62828', Fulfilled: '#1e8a4c', Cancelled: '#9aa1ac',
};
const AXIS = { fontSize: 12, fill: '#5b6370' };
const GRID = '#eceef1';
const TOOLTIP = {
  contentStyle: { borderRadius: 8, border: '1px solid #e3e6eb', boxShadow: '0 4px 16px rgba(16,24,40,.08)', fontSize: 13 },
  cursor: { fill: 'rgba(16,24,40,.04)' },
};

/** Card wrapper with an accessible "view as table" toggle for every chart. */
export function ChartCard({ title, description, table, children, className = '' }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className={`card chart-card ${className}`}>
      <header className="card-header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {table && (
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowTable((v) => !v)}
            aria-label={showTable ? 'Show chart' : 'Show data table'}
            title={showTable ? 'Show chart' : 'Show data table'}
          >
            {showTable ? <BarChart3 size={16} /> : <Table2 size={16} />}
          </button>
        )}
      </header>
      {showTable && table ? (
        <div className="table-scroll">
          <table className="table table-compact">
            <thead><tr>{table.columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>{table.columns.map(([key]) => <td key={key}>{row[key]}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="chart-area">{children}</div>}
    </section>
  );
}

export function DonorGroupChart({ data }) {
  return (
    <ChartCard
      title="Donors by blood group"
      description="Registered donors in each group"
      table={{ rows: data, columns: [['group', 'Blood group'], ['donors', 'Donors']] }}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="group" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip {...TOOLTIP} />
          <Bar dataKey="donors" name="Donors" fill={SERIES.red} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyDonationsChart({ data }) {
  return (
    <ChartCard
      title="Monthly donations"
      description="Units collected over the last 6 months"
      table={{ rows: data, columns: [['month', 'Month'], ['units', 'Units']] }}
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="donationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES.blue} stopOpacity={0.18} />
              <stop offset="100%" stopColor={SERIES.blue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip {...TOOLTIP} cursor={{ stroke: '#c5cad3' }} />
          <Area
            type="monotone" dataKey="units" name="Units" stroke={SERIES.blue} strokeWidth={2}
            fill="url(#donationFill)" dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function InventoryChart({ data }) {
  return (
    <ChartCard
      title="Blood inventory"
      description="Available and reserved units across all blood banks"
      table={{ rows: data, columns: [['group', 'Blood group'], ['available', 'Available'], ['reserved', 'Reserved'], ['total', 'Total']] }}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="group" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip {...TOOLTIP} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="available" name="Available" stackId="u" fill={SERIES.blue} stroke="#fff" strokeWidth={1} maxBarSize={32} />
          <Bar dataKey="reserved" name="Reserved" stackId="u" fill={SERIES.orange} stroke="#fff" strokeWidth={1} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RequestStatusChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <ChartCard
      title="Request status"
      description="All blood requests by current status"
      table={{ rows: data, columns: [['status', 'Status'], ['count', 'Requests']] }}
    >
      <div className="donut-layout">
        <div className="donut">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="status" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
                {data.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status]} />)}
              </Pie>
              <Tooltip {...TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center"><strong>{total}</strong><span>requests</span></div>
        </div>
        <ul className="legend-list">
          {data.map((d) => (
            <li key={d.status}>
              <span className="legend-swatch" style={{ background: STATUS_COLORS[d.status] }} aria-hidden="true" />
              <span>{d.status}</span>
              <strong>{d.count}</strong>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}

export function PriorityChart({ data }) {
  return (
    <ChartCard
      title="Requests by priority"
      description="Emergency requests are highlighted"
      table={{ rows: data, columns: [['priority', 'Priority'], ['count', 'Requests']] }}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="priority" tick={AXIS} axisLine={false} tickLine={false} width={72} />
          <Tooltip {...TOOLTIP} />
          <Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((d) => <Cell key={d.priority} fill={d.priority === 'Emergency' ? SERIES.red : SERIES.gray} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
