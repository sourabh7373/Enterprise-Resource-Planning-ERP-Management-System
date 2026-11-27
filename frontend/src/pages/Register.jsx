import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, User, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field validations
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register(fullName, email, password);
      if (result.success) {
        setSuccess('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#E2E8F0]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-[#172554] p-3.5 rounded-2xl shadow-lg border border-[#334155]">
            <Building2 size={32} className="text-[#38BDF8]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#FFFFFF] tracking-tight">
          Apex ERP Cloud
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          Create Enterprise Account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#172554] py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-[#334155]">
          {error && (
            <div className="mb-6 bg-rose-950/60 border border-rose-800/65 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-rose-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-950/60 border border-emerald-800/65 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-emerald-300">{success}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <User size={18} />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-sm placeholder-[#94A3B8] text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-sm placeholder-[#94A3B8] text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-sm placeholder-[#94A3B8] text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock size={18} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-sm placeholder-[#94A3B8] text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Enterprise Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#94A3B8]">
              Already have an enterprise account?{' '}
              <Link to="/login" className="font-bold text-[#38BDF8] hover:text-[#2563EB]">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-[#38BDF8]" />
          <span>Secured with 256-Bit Enterprise Encryption</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
