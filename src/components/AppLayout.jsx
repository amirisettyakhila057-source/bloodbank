import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Loader from './Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/** Authenticated shell: Sidebar | (Header + page content). */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <Sidebar user={user} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
      <div className="app-main">
        <Header user={user} onMenu={() => setMenuOpen(true)} />
        <main className="content" id="main">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
