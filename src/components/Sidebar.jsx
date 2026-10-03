import { X } from 'lucide-react';
import Navbar from './Navbar';
import Logo from './Logo';
import { ADMIN_NAV, USER_NAV } from '../utils/navigation';
import { initials } from '../utils/format';

export default function Sidebar({ user, open, onClose, onLogout }) {
  const items = user.role === 'admin' ? ADMIN_NAV : USER_NAV;
  return (
    <>
      <div className={`drawer-overlay ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Sidebar">
        <div className="sidebar-top">
          <Logo />
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <p className="nav-section">{user.role === 'admin' ? 'Administration' : 'My account'}</p>
        <Navbar items={items} onNavigate={onClose} onLogout={onLogout} />
        <div className="sidebar-user">
          <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
          <div>
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-role">{user.role === 'admin' ? 'Administrator' : user.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
