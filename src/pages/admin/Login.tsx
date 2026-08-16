import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Flame, Loader2 } from 'lucide-react';
import { signIn } from '@/services/auth';
import { fetchAdminProfile } from '@/services/auth';
import { signOutAdmin } from '@/services/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signIn(email, password);
      const profile = await fetchAdminProfile(user.uid);
      if (!profile) {
        await signOutAdmin();
        toast.error('This account is not authorized as an admin. Contact the owner to be added.');
        return;
      }
      toast.success(`Welcome back, ${profile.name || profile.email}`);
      navigate('/admin');
    } catch (err) {
      toast.error('Sign-in failed. Check your email and password.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-vignette">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Flame className="mx-auto text-saffron mb-3" size={26} />
          <h1 className="font-display text-2xl text-ivory">Admin Access</h1>
          <p className="text-ivory/45 text-sm mt-1">MMR Youth Force — Vinayaka Chaturthi 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-7 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs text-ivory/50 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-charcoal-50 border border-copper/20 rounded-lg px-3.5 py-2.5 text-sm text-ivory focus:outline-none focus:border-saffron"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs text-ivory/50 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-charcoal-50 border border-copper/20 rounded-lg px-3.5 py-2.5 text-sm text-ivory focus:outline-none focus:border-saffron"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-saffron text-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-saffron-light transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
