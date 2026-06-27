import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (username === 'admin' && password === 'admin@123') {
        localStorage.setItem('vrplay-auth', 'true');
        toast.success('Welcome back, Admin!');
        navigate('/', { replace: true });
      } else {
        toast.error('Invalid username or password');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans antialiased">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-650/15 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"></div>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl z-10 space-y-6 mx-4">
        
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-violet-600/10 rounded-2xl border border-violet-500/20 text-violet-400 mb-2">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">VR Play CMS</h2>
          <p className="text-sm text-slate-400">Sign in to manage your learning platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-violet-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-violet-500/50 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 text-[11px] text-slate-500 leading-normal">
            <span className="font-semibold text-slate-400">Demo Credentials:</span><br />
            Username: <code className="text-violet-400">admin</code> | Password: <code className="text-violet-400">admin@123</code>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-750 hover:to-indigo-750 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-650/15 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
