import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { dummyUser } from '../context/dummyData';
import Button from '../components/ui/Button';

const Orbs = ({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl ${isDark ? 'opacity-20 bg-brand-400' : 'opacity-12 bg-brand-300'}`} />
    <div className={`absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'opacity-15 bg-teal-400' : 'opacity-10 bg-teal-300'}`} />
    <div className={`absolute top-1/2 right-1/4 w-72 h-72 rounded-full blur-3xl ${isDark ? 'opacity-10 bg-purple-500' : 'opacity-8 bg-purple-300'}`} />
  </div>
);

const SunIcon  = () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>);
const MoonIcon = () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>);

const AuthField = ({ label, type = 'text', value, onChange, error, placeholder, icon }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-white/55 font-body tracking-wide">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">{icon}</span>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full h-11 rounded-xl text-sm font-body bg-white/6 hover:bg-white/9 border transition-all duration-200 text-white placeholder-white/22 focus:outline-none focus:ring-2 ${icon ? 'pl-10' : 'pl-4'} pr-4 ${error ? 'border-red-400/50 focus:border-red-400/70 focus:ring-red-400/20' : 'border-white/10 hover:border-white/18 focus:border-brand-400/60 focus:ring-brand-400/20 focus:bg-white/10'}`}
      />
    </div>
    {error && <p className="text-xs text-red-400 font-body flex items-center gap-1"><span>⚠</span> {error}</p>}
  </div>
);

export default function Login() {
  const { state, dispatch } = useContext(AppContext);
  const isDark = state.theme === 'dark';
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email.trim())                    errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email    = 'Enter a valid email address';
    if (!form.password)                         errs.password = 'Password is required';
    else if (form.password.length < 6)          errs.password = 'Minimum 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    dispatch({ type: 'LOGIN', payload: { name: dummyUser.name, email: form.email } });
    navigate('/planner');
  };

  return (
    // Change the outermost div className to just:
<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-surface-900">
      {isDark && <div className="fixed inset-0 bg-grid-dark bg-grid opacity-100 pointer-events-none" />}
      <Orbs />
     

      <div className="relative w-full max-w-[380px] animate-slide-up">
        {isDark && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-400/20 to-teal-400/20 blur-xl -z-10 scale-105" />}
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-surface-850/80 backdrop-blur-2xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.7)]' : 'bg-white/90 backdrop-blur-xl border border-black/8 shadow-[0_20px_60px_rgba(0,0,0,0.10)]'}`}>
          <div className="h-[3px] w-full bg-gradient-to-r from-brand-400 via-purple-400 to-teal-400" />
          <div className="px-8 py-8 flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 text-center pb-1">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center shadow-glow-brand">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-surface-850 animate-pulse-soft" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold font-display ${isDark ? 'text-white' : 'text-surface-900'}`}>Welcome back</h1>
                <p className={`text-sm font-body mt-1 ${isDark ? 'text-white/45' : 'text-surface-500'}`}>Sign in to <span className="text-brand-400 font-medium">Study Buddy</span></p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <AuthField label="Email address" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@college.edu"
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 6 10-6"/></svg>}
              />
              <AuthField label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="••••••••"
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
              />
              <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border ${isDark ? 'bg-brand-400/6 border-brand-400/18' : 'bg-brand-50 border-brand-200/60'}`}>
                <span className="text-sm flex-shrink-0 mt-px">💡</span>
                <p className={`text-xs font-body leading-relaxed ${isDark ? 'text-white/40' : 'text-brand-700/70'}`}>Any email + password (6+ chars) works. This is a demo.</p>
              </div>
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-1 font-semibold tracking-wide shadow-glow-brand">
                Sign In →
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-black/8'}`} />
              <span className={`text-xs font-body ${isDark ? 'text-white/25' : 'text-black/30'}`}>or</span>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-black/8'}`} />
            </div>

            <button type="button" onClick={() => { dispatch({ type: 'LOGIN', payload: dummyUser }); navigate('/planner'); }}
              className={`w-full h-10 rounded-xl text-sm font-medium font-body flex items-center justify-center gap-2 border transition-all duration-200 active:scale-[0.98] ${isDark ? 'bg-white/4 hover:bg-white/8 border-white/10 hover:border-white/20 text-white/55 hover:text-white' : 'bg-surface-100 hover:bg-surface-200 border-surface-200 text-surface-500 hover:text-surface-900'}`}
            >
              ⚡ Quick demo login
            </button>

            <p className={`text-center text-sm font-body ${isDark ? 'text-white/35' : 'text-surface-400'}`}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors underline-offset-2 hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
        <p className={`text-center text-xs font-body mt-5 ${isDark ? 'text-white/18' : 'text-black/25'}`}>Study smarter, not harder 🎓</p>
      </div>
    </div>
  );
}