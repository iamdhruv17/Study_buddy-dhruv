import { useState, useContext, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Orbs = ({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className={`absolute -top-32 -right-32 w-[450px] h-[450px] rounded-full blur-3xl ${isDark ? 'opacity-18 bg-teal-400' : 'opacity-10 bg-teal-300'}`} />
    <div className={`absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full blur-3xl ${isDark ? 'opacity-18 bg-brand-400' : 'opacity-10 bg-brand-300'}`} />
  </div>
);

const SunIcon  = () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>);
const MoonIcon = () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>);

const AuthField = ({ label, type = 'text', value, onChange, error, placeholder, icon }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-white/55 font-body tracking-wide">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-sm">{icon}</span>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full h-11 rounded-xl text-sm font-body bg-white/6 hover:bg-white/9 border transition-all duration-200 text-white placeholder-white/22 focus:outline-none focus:ring-2 ${icon ? 'pl-10' : 'pl-4'} pr-4 ${error ? 'border-red-400/50 focus:border-red-400/70 focus:ring-red-400/20' : 'border-white/10 hover:border-white/18 focus:border-brand-400/60 focus:ring-brand-400/20 focus:bg-white/10'}`}
      />
    </div>
    {error && <p className="text-xs text-red-400 font-body flex items-center gap-1"><span>⚠</span> {error}</p>}
  </div>
);

const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)           score++;
  if (pw.length >= 10)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-400'    };
  if (score <= 3) return { score, label: 'Fair',   color: 'bg-amber-400'  };
  if (score <= 4) return { score, label: 'Good',   color: 'bg-teal-400'   };
  return              { score, label: 'Strong', color: 'bg-emerald-400' };
};

const StrengthMeter = ({ password }) => {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(b => (
          <div key={b} className={`flex-1 h-1 rounded-full transition-all duration-300 ${b <= score ? color : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs font-body ${score <= 1 ? 'text-red-400' : score <= 3 ? 'text-amber-400' : score <= 4 ? 'text-teal-400' : 'text-emerald-400'}`}>{label} password</p>
    </div>
  );
};

export default function Signup() {
  const { state, dispatch } = useContext(AppContext);
  const isDark = state.theme === 'dark';
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name     = 'Enter your full name (min 2 chars)';
    if (!form.email.trim())                                errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))            errs.email    = 'Enter a valid email';
    if (!form.password)                                    errs.password = 'Password is required';
    else if (form.password.length < 6)                     errs.password = 'Minimum 6 characters';
    if (form.confirm !== form.password)                    errs.confirm  = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    dispatch({ type: 'SIGNUP', payload: { name: form.name.trim(), email: form.email.trim() } });
    navigate('/planner');
  };

  const reqs = useMemo(() => ({
    length: form.password.length >= 6,
    upper:  /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    match:  form.confirm.length > 0 && form.confirm === form.password,
  }), [form.password, form.confirm]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-surface-900' : 'bg-gradient-to-br from-slate-100 to-teal-50'}`}>
      {isDark && <div className="fixed inset-0 bg-grid-dark bg-grid opacity-100 pointer-events-none" />}
      <Orbs isDark={isDark} />
      <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })} className={`fixed top-5 right-5 z-20 w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 ${isDark ? 'bg-white/6 hover:bg-white/12 border-white/10 text-white/50 hover:text-white' : 'bg-white/80 hover:bg-white border-black/8 text-black/50 hover:text-black shadow-sm'}`}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="relative w-full max-w-[400px] animate-slide-up">
        {isDark && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400/15 to-brand-400/15 blur-xl -z-10 scale-105" />}
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-surface-850/80 backdrop-blur-2xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.65)]' : 'bg-white/90 backdrop-blur-xl border border-black/8 shadow-[0_20px_60px_rgba(0,0,0,0.10)]'}`}>
          <div className="h-[3px] w-full bg-gradient-to-r from-teal-400 via-brand-400 to-purple-400" />
          <div className="px-8 py-8 flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-brand-400 flex items-center justify-center shadow-glow-teal">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div>
                <h1 className={`text-2xl font-bold font-display ${isDark ? 'text-white' : 'text-surface-900'}`}>Create account</h1>
                <p className={`text-sm font-body mt-1 ${isDark ? 'text-white/45' : 'text-surface-500'}`}>Join <span className="text-teal-400 font-medium">Study Buddy</span> today</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <AuthField label="Full name"       value={form.name}     onChange={set('name')}     error={errors.name}     placeholder="Arjun Sharma"             icon="👤" />
              <AuthField label="Email address"   type="email" value={form.email}    onChange={set('email')}    error={errors.email}    placeholder="you@college.edu"          icon="✉"  />
              <div className="flex flex-col gap-2">
                <AuthField label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="Create a strong password" icon="🔒" />
                <StrengthMeter password={form.password} />
              </div>
              <AuthField label="Confirm password" type="password" value={form.confirm}  onChange={set('confirm')}  error={errors.confirm}  placeholder="Repeat your password"     icon="🔑" />

              {(form.password.length > 0 || form.confirm.length > 0) && (
                <div className={`flex flex-col gap-1.5 px-3 py-3 rounded-xl border ${isDark ? 'bg-white/4 border-white/8' : 'bg-surface-50 border-surface-200'}`}>
                  {[
                    { key: 'length', label: 'At least 6 characters' },
                    { key: 'upper',  label: 'One uppercase letter'  },
                    { key: 'number', label: 'One number'            },
                    { key: 'match',  label: 'Passwords match'       },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${reqs[key] ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/8 text-white/20'}`}>{reqs[key] ? '✓' : '·'}</div>
                      <span className={`text-xs font-body transition-colors ${reqs[key] ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-white/35' : 'text-surface-400')}`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`w-full h-12 rounded-xl text-sm font-semibold font-body flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] ${loading ? 'opacity-60 cursor-not-allowed bg-teal-500 text-white' : 'bg-gradient-to-r from-teal-400 to-brand-400 hover:from-teal-500 hover:to-brand-500 text-white shadow-glow-teal'}`}
              >
                {loading && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            <p className={`text-center text-sm font-body ${isDark ? 'text-white/35' : 'text-surface-400'}`}>
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors underline-offset-2 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
        <p className={`text-center text-xs font-body mt-5 ${isDark ? 'text-white/18' : 'text-black/25'}`}>Your data stays local — no servers, no tracking 🔒</p>
      </div>
    </div>
  );
}