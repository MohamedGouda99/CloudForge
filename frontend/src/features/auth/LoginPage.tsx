import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../lib/api/client';
import { useAuthStore } from '../../lib/store/authStore';
import { useThemeStore } from '../../lib/store/themeStore';
import AuthHero from '/illustration1.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasGoogle = Boolean(GOOGLE_CLIENT_ID);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const loginRes = await apiClient.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = loginRes.data;

      // Get user info
      const userRes = await apiClient.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setAuth(access_token, userRes.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth via Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const existing = document.getElementById('google-identity');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.id = 'google-identity';
      script.onload = () => setGoogleReady(true);
      document.body.appendChild(script);
    } else {
      setGoogleReady(true);
    }
  }, [GOOGLE_CLIENT_ID]);

  useEffect(() => {
    const google = (window as any).google;
    if (!googleReady || !google || !googleButtonRef.current || !GOOGLE_CLIENT_ID) return;
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        if (!response?.credential) return;
        try {
          setLoading(true);
          const res = await apiClient.post('/api/auth/google', { id_token: response.credential });
          const { access_token } = res.data;
          const me = await apiClient.get('/api/auth/me', { headers: { Authorization: `Bearer ${access_token}` } });
          setAuth(access_token, me.data);
          navigate('/dashboard');
        } catch (err: any) {
          setError(err?.response?.data?.detail || 'Google sign-in failed');
        } finally {
          setLoading(false);
        }
      },
    });
    google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
      shape: 'pill',
    });
  }, [googleReady, GOOGLE_CLIENT_ID, navigate, setAuth]);

  return (
    <div className="min-h-screen flex bg-white text-slate-900">
      {/* Left: form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">CF</span>
            </div>
            <span className="text-lg font-semibold">CloudForge</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200 hover:border-primary/60 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold mb-2">Log in to your account</h1>
          <p className="text-slate-500 mb-8">Welcome back! Select your login method</p>

          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              {hasGoogle ? (
                <div ref={googleButtonRef} className="w-full flex justify-center" />
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full max-w-sm px-4 py-3 rounded-full border border-slate-200 flex items-center justify-center gap-3 bg-white text-slate-500 shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 533.5 544.3">
                    <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.5-37-4.6-55H272v104h147.3c-6.3 34-25 62.7-53.4 82v68h86.2c50.6-46.6 80-115.4 80-199z"/>
                    <path fill="#34A853" d="M272 544.3c72.4 0 133.1-23.9 177.5-64.9l-86.2-68c-23.9 16.1-54.6 25.6-91.3 25.6-70 0-129.4-47-150.7-110.2H31.8v69.3C76.7 482 167.7 544.3 272 544.3z"/>
                    <path fill="#FBBC05" d="M121.3 326.8c-10.6-31.8-10.6-66.2 0-98l-69.5-69.3C7.5 205.7 0 238.1 0 272s7.5 66.3 21.8 112.5l69.5-69.3z"/>
                    <path fill="#EA4335" d="M272 107.7c39.3-.6 77.1 13.9 106 40.9l79.2-79.2C404.9 24.3 343.8.3 272 0 167.7 0 76.7 62.3 31.8 159.5l89.5 69.3C142.6 153.9 202 107.7 272 107.7z"/>
                  </svg>
                  <span className="font-semibold">Continue with Google</span>
                </button>
              )}
              {!hasGoogle && (
                <p className="text-xs text-red-500 text-center">
                  Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <span className="flex-1 h-px bg-slate-200" />
              <span>or continue with email</span>
              <span className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Email or username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-primary">
                <Link to="/forgot" className="hover:underline">Forgot password?</Link>
                <Link to="/register" className="hover:underline">Register</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-gradient-to-r from-primary to-purple-500 text-white font-semibold hover:brightness-105 transition disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="mt-10 text-xs text-slate-400">
            Copyright © CloudForge {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right: hero */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#7b5af2] to-[#4b67ff] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.15),transparent_30%)]" />
        <div className="m-auto max-w-4xl p-10 text-white relative z-10">
          <div className="bg-white/12 backdrop-blur rounded-3xl p-6 shadow-2xl border border-white/20">
            <img src={AuthHero} alt="Cloud design to code" className="w-full h-auto rounded-2xl shadow-2xl border border-white/30" />
            <p className="mt-6 text-xl font-semibold">Meet your cloud design-to-code app</p>
            <p className="text-sm text-white/80 mt-2">
              Visualize, validate, and generate Terraform in one sleek workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
