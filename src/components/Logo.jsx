import { Droplet } from 'lucide-react';

export default function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark" aria-hidden="true"><Droplet size={18} fill="currentColor" /></span>
      <span className="logo-text">LifeFlow<small>Blood Bank System</small></span>
    </div>
  );
}
