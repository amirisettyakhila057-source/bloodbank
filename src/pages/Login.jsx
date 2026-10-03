import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loginSchema } from '../utils/validation';
import { homeFor } from '../routes/AppRoutes';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@bloodbank.com', password: 'admin123' },
  { role: 'User', email: 'user@bloodbank.com', password: 'user123' },
];

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const { field, setValues, handleSubmit, submitting } = useForm({ email: '', password: '' }, loginSchema);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError('');
    const result = await login(email, password);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
    const from = location.state?.from;
    const canReturn = from && (result.user.role === 'admin') === from.startsWith('/admin');
    navigate(canReturn ? from : homeFor(result.user), { replace: true });
  });

  return (
    <AuthLayout title="Sign in" subtitle="Enter your account details to continue.">
      <form className="form-stack" onSubmit={onSubmit} noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <FormInput label="Email" type="email" autoComplete="email" placeholder="you@example.com" required {...field('email')} />
        <FormInput label="Password" type="password" autoComplete="current-password" placeholder="••••••••" required {...field('password')} />
        <div className="form-row-between">
          <span />
          <Link to="/forgot-password" className="link">Forgot password?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? <span className="spinner spinner-sm" aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
          {submitting ? 'Signing in…' : 'Login'}
        </button>
        <Link to="/signup" className="btn btn-secondary btn-block">Create Account</Link>
      </form>

      <section className="demo-box" aria-labelledby="demo-title">
        <h2 id="demo-title">Demo credentials</h2>
        <div className="demo-grid">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.role}
              type="button"
              className="demo-account"
              onClick={() => setValues({ email: a.email, password: a.password })}
            >
              <strong>{a.role}</strong>
              <span>{a.email}</span>
              <span>{a.password}</span>
            </button>
          ))}
        </div>
        <p className="field-hint">Click an account to fill the form.</p>
      </section>
    </AuthLayout>
  );
}
