import { Droplets, ShieldCheck, Siren, Users } from 'lucide-react';
import Logo from './Logo';

const HIGHLIGHTS = [
  { icon: Users, text: 'Register donors and track donation eligibility' },
  { icon: Droplets, text: 'Live blood stock across partner blood banks' },
  { icon: Siren, text: 'Prioritise and approve emergency requests' },
  { icon: ShieldCheck, text: 'Role-based access for admins and users' },
];

/** Split-screen layout shared by Login, Signup and Forgot Password. */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Logo />
        <div className="auth-aside-body">
          <h2>Connecting donors, blood banks and hospitals.</h2>
          <p>One place to manage donors, blood inventory and urgent blood requests.</p>
          <ul>
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text}><Icon size={18} aria-hidden="true" />{text}</li>
            ))}
          </ul>
        </div>
        <p className="auth-aside-foot">Academic project · Frontend demo using Local Storage</p>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo /></div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
