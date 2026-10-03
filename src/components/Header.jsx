import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import Badge from './Badge';
import { pageTitle } from '../utils/navigation';
import { initials } from '../utils/format';

export default function Header({ user, onMenu }) {
  const { pathname } = useLocation();
  const home = user.role === 'admin' ? '/admin' : '/dashboard';
  const title = pageTitle(pathname);

  return (
    <header className="topbar">
      <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <ol>
          <li><Link to={home}>{user.role === 'admin' ? 'Admin' : 'Home'}</Link></li>
          {pathname !== home && (
            <li aria-current="page"><ChevronRight size={14} aria-hidden="true" />{title}</li>
          )}
        </ol>
      </nav>
      <div className="topbar-user">
        <Badge tone={user.role === 'admin' ? 'info' : 'neutral'}>{user.role === 'admin' ? 'Admin' : 'User'}</Badge>
        <Link to="/profile" className="avatar" aria-label="Open profile">{initials(user.name)}</Link>
      </div>
    </header>
  );
}
