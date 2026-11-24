import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Invalid email or password');
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
          Enterprise Management Platform
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

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-sm placeholder-[#94A3B8] text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#FFFFFF]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-[#0F172A] text-[#2563EB] focus:ring-[#2563EB] border-[#334155] rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[#CBD5E1] font-medium">
                  Remember this device
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-[#38BDF8] hover:text-[#2563EB]">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#94A3B8]">
              Don't have an enterprise account?{' '}
              <Link to="/register" className="font-bold text-[#38BDF8] hover:text-[#2563EB]">
                Register organization
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

export default Login;
