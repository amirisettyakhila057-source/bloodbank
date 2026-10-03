import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const UserDashboard = lazy(() => import('../pages/UserDashboard'));
const Donors = lazy(() => import('../pages/Donors'));
const Hospitals = lazy(() => import('../pages/Hospitals'));
const BloodInventory = lazy(() => import('../pages/BloodInventory'));
const BloodRequests = lazy(() => import('../pages/BloodRequests'));
const Users = lazy(() => import('../pages/Users'));
const Reports = lazy(() => import('../pages/Reports'));
const BloodSearch = lazy(() => import('../pages/BloodSearch'));
const DonorRegistration = lazy(() => import('../pages/DonorRegistration'));
const MyRequests = lazy(() => import('../pages/MyRequests'));
const DonationHistory = lazy(() => import('../pages/DonationHistory'));
const Profile = lazy(() => import('../pages/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/dashboard');

/** Requires a signed-in user; optionally restricts to specific roles. */
function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

/** Login/signup pages are only for signed-out visitors. */
function PublicRoute() {
  const { user } = useAuth();
  return user ? <Navigate to={homeFor(user)} replace /> : <Outlet />;
}

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user) : '/login'} replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullscreen />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/search" element={<BloodSearch />} />
            <Route path="/profile" element={<Profile />} />

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/donors" element={<Donors />} />
              <Route path="/admin/hospitals" element={<Hospitals />} />
              <Route path="/admin/inventory" element={<BloodInventory />} />
              <Route path="/admin/requests" element={<BloodRequests key="all" />} />
              <Route path="/admin/emergency" element={<BloodRequests key="emergency" emergencyOnly />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>

            <Route element={<ProtectedRoute roles={['user']} />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/become-donor" element={<DonorRegistration />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/donation-history" element={<DonationHistory />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
