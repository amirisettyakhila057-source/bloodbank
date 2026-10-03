import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import { useForm } from '../hooks/useForm';
import { rules } from '../utils/validation';

/** UI only: a frontend demo cannot send emails, so this explains what would happen. */
export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState('');
  const { field, handleSubmit } = useForm({ email: '' }, { email: [rules.email] });

  return (
    <AuthLayout title="Reset password" subtitle="Enter your account email and we will send reset instructions.">
      {sentTo ? (
        <div className="form-stack">
          <div className="alert alert-success" role="status">
            <MailCheck size={18} aria-hidden="true" />
            <span>If an account exists for <strong>{sentTo}</strong>, reset instructions would be emailed.</span>
          </div>
          <p className="field-hint">
            This is a frontend-only demo, so no email is actually sent. A production system would email a
            time-limited reset link from a secure backend.
          </p>
          <Link to="/login" className="btn btn-secondary btn-block"><ArrowLeft size={18} aria-hidden="true" /> Back to sign in</Link>
        </div>
      ) : (
        <form className="form-stack" onSubmit={handleSubmit(({ email }) => setSentTo(email.trim()))} noValidate>
          <FormInput label="Email" type="email" autoComplete="email" placeholder="you@example.com" required {...field('email')} />
          <button type="submit" className="btn btn-primary btn-block">Send reset link</button>
          <Link to="/login" className="btn btn-ghost btn-block"><ArrowLeft size={18} aria-hidden="true" /> Back to sign in</Link>
        </form>
      )}
    </AuthLayout>
  );
}
