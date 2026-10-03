import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Select from '../components/Select';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { signupSchema } from '../utils/validation';
import { ACCOUNT_TYPES } from '../utils/constants';

const INITIAL = { name: '', email: '', phone: '', accountType: 'donor', password: '', confirmPassword: '' };

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { field, setErrors, handleSubmit, submitting } = useForm(INITIAL, signupSchema);

  const onSubmit = handleSubmit(async (values) => {
    const result = await signup(values);
    if (!result.ok) {
      setErrors({ [result.field]: result.message });
      return;
    }
    toast.success('Account created successfully. Please sign in.');
    navigate('/login', { replace: true });
  });

  return (
    <AuthLayout title="Create your account" subtitle="Join as a donor, hospital staff member or general user.">
      <form className="form-stack" onSubmit={onSubmit} noValidate>
        <FormInput label="Full name" autoComplete="name" placeholder="e.g. Priya Sharma" required {...field('name')} />
        <div className="form-grid">
          <FormInput label="Email" type="email" autoComplete="email" placeholder="you@example.com" required {...field('email')} />
          <FormInput label="Phone" type="tel" autoComplete="tel" placeholder="10-digit mobile number" required {...field('phone')} />
        </div>
        <Select
          label="Role"
          options={ACCOUNT_TYPES}
          hint="All public accounts are created with the User role. Admin accounts are managed by the system."
          required
          {...field('accountType')}
        />
        <div className="form-grid">
          <FormInput label="Password" type="password" autoComplete="new-password" hint="At least 6 characters" required {...field('password')} />
          <FormInput label="Confirm password" type="password" autoComplete="new-password" required {...field('confirmPassword')} />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? <span className="spinner spinner-sm" aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>
        <p className="center muted">Already have an account? <Link to="/login" className="link">Sign in</Link></p>
      </form>
    </AuthLayout>
  );
}
