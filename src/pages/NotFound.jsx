import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../routes/AppRoutes';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="card">
      <EmptyState
        icon={Compass}
        title="Page not found"
        message="The page you are looking for does not exist or has moved."
        action={<Link to={homeFor(user)} className="btn btn-primary">Go to dashboard</Link>}
      />
    </div>
  );
}
