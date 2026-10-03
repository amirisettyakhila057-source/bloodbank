import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getBloodRequests } from '../utils/localStorage';
import { isOpenEmergency } from '../utils/stats';

/** Role-specific navigation links (used inside the Sidebar). */
export default function Navbar({ items, onNavigate, onLogout }) {
  const requests = useStore(getBloodRequests);
  const counts = { emergency: requests.filter(isOpenEmergency).length };

  return (
    <nav className="nav" aria-label="Main navigation">
      <ul>
        {items.map(({ path, label, icon: Icon, end, badge }) => (
          <li key={path}>
            <NavLink to={path} end={end} className="nav-link" onClick={onNavigate}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              {badge && counts[badge] > 0 && (
                <span className="nav-count" aria-label={`${counts[badge]} open`}>{counts[badge]}</span>
              )}
            </NavLink>
          </li>
        ))}
        <li>
          <button type="button" className="nav-link" onClick={onLogout}>
            <LogOut size={18} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
