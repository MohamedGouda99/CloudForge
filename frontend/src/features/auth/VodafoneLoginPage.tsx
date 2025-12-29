import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../lib/api/client';
import { useAuthStore } from '../../lib/store/authStore';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Cloud,
  Server,
  Database,
  Network,
  Terminal,
  Cpu,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// Technical color palette
const colors = {
  primary: '#0EA5E9',
  secondary: '#06B6D4',
  accent: '#3B82F6',
  success: '#10B981',
  vodafone: '#E60000',
};

// Tech grid background
const TechGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.08]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(14, 165, 233, 0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14, 165, 233, 0.5) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
  </div>
);

// Floating particles
const TechParticles = () => {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 10,
      color: [
        'rgba(14, 165, 233, 0.4)',
        'rgba(6, 182, 212, 0.4)',
        'rgba(59, 130, 246, 0.3)',
      ][Math.floor(Math.random() * 3)],
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animation: `floatParticle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-25px) translateX(10px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

// Floating tech icons
const FloatingIcons = () => {
  const icons = [
    { Icon: Cloud, x: 10, y: 15, delay: 0 },
    { Icon: Server, x: 85, y: 20, delay: 1 },
    { Icon: Database, x: 75, y: 75, delay: 2 },
    { Icon: Network, x: 15, y: 80, delay: 1.5 },
    { Icon: Terminal, x: 90, y: 50, delay: 0.5 },
    { Icon: Cpu, x: 8, y: 50, delay: 2.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, x, y, delay }, i) => (
        <div
          key={i}
          className="absolute text-cyan-500/15"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animation: `floatIcon 10s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        >
          <Icon className="w-8 h-8" />
        </div>
      ))}
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          50% { transform: translateY(-15px) rotate(5deg); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
};

// Animated gradient orbs
const GradientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)',
        top: '-20%',
        left: '-10%',
        animation: 'orbFloat 20s ease-in-out infinite',
      }}
    />
    <div
      className="absolute w-[400px] h-[400px] rounded-full opacity-15"
      style={{
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
        bottom: '-15%',
        right: '-5%',
        animation: 'orbFloat 25s ease-in-out infinite reverse',
      }}
    />
    <div
      className="absolute w-[300px] h-[300px] rounded-full opacity-10"
      style={{
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'orbPulse 15s ease-in-out infinite',
      }}
    />
    <style>{`
      @keyframes orbFloat {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(30px, 20px); }
      }
      @keyframes orbPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.15; }
      }
    `}</style>
  </div>
);

// Feature item with animation
const FeatureItem = ({ icon: Icon, title, description, delay }: {
  icon: any;
  title: string;
  description: string;
  delay: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex items-start gap-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
    >
      <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-500/30 flex-shrink-0">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
};

// Animated input component
const AnimatedInput = ({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  label,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
}: {
  icon: any;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="group">
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            isFocused ? 'text-cyan-400' : 'text-slate-500'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <input
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required
          className={`w-full pl-11 pr-${showPasswordToggle ? '12' : '4'} py-3.5 bg-slate-800/50 border rounded-xl
                   text-white placeholder-slate-500 transition-all duration-300
                   focus:outline-none focus:bg-slate-800/70
                   ${isFocused ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-slate-700'}`}
          placeholder={placeholder}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {/* Focus glow effect */}
        <div
          className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ${
            isFocused ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.1), transparent)',
          }}
        />
      </div>
    </div>
  );
};

export default function VodafoneLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const loginRes = await apiClient.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = loginRes.data;

      const userRes = await apiClient.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setAuth(access_token, userRes.data);
      navigate('/dashboard');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '));
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        <TechGrid />
        <TechParticles />
        <FloatingIcons />
        <GradientOrbs />

        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <div>
            {/* Logo */}
            <div
              className={`transition-all duration-700 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="bg-white rounded-xl p-3 shadow-lg shadow-cyan-500/10 group-hover:shadow-cyan-500/20 transition-shadow">
                  <img
                    src="/vodafone.png"
                    alt="Vodafone"
                    className="h-8 w-auto"
                    onError={(e) => {
                      e.currentTarget.parentElement!.innerHTML =
                        '<span class="text-red-600 font-bold text-2xl">V</span>';
                    }}
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">CloudForge</span>
                  <span className="text-[10px] text-slate-500 block">Enterprise</span>
                </div>
              </Link>
            </div>

            {/* Headline */}
            <div
              className={`mt-16 transition-all duration-700 delay-100 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-sm mb-6">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Secure Enterprise Access</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Welcome to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
                  CloudForge
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-md">
                Vodafone's next-generation Infrastructure as Code platform for enterprise teams.
              </p>
            </div>

            {/* Features */}
            <div
              className={`mt-12 space-y-5 transition-all duration-700 delay-200 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <FeatureItem
                icon={Shield}
                title="Enterprise Security"
                description="Bank-grade encryption and compliance standards"
                delay={400}
              />
              <FeatureItem
                icon={Cloud}
                title="Multi-Cloud Support"
                description="Manage AWS, Azure, and GCP from one platform"
                delay={550}
              />
              <FeatureItem
                icon={Zap}
                title="AI-Powered Design"
                description="Intelligent infrastructure recommendations"
                delay={700}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className={`text-slate-500 text-sm transition-all duration-700 delay-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p>&copy; 2025 Vodafone Group. All rights reserved.</p>
            <p className="mt-1 text-slate-600">CloudForge Enterprise v1.0</p>
          </div>
        </div>

        {/* Animated border line */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <TechGrid />

        <div
          className={`w-full max-w-md relative z-10 transition-all duration-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="bg-white rounded-xl p-3">
                <img
                  src="/vodafone.png"
                  alt="Vodafone"
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML =
                      '<span class="text-red-600 font-bold text-2xl">V</span>';
                  }}
                />
              </div>
              <span className="text-xl font-bold text-white">CloudForge</span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800 shadow-2xl shadow-black/20">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-slate-400">Access your CloudForge account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-300">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatedInput
                icon={Mail}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                label="Email or Username"
              />

              <AnimatedInput
                icon={Lock}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                label="Password"
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-slate-900"
                    />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold
                         hover:from-red-500 hover:to-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                         transform hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                {loading ? (
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <span className="text-sm text-slate-500">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>

            {/* SSO Button */}
            <button
              className="w-full py-3.5 border border-slate-700 rounded-xl font-medium text-slate-300
                       hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300
                       flex items-center justify-center gap-3 group"
            >
              <img
                src="/vodafone.png"
                alt="Vodafone"
                className="h-5 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>Sign in with Vodafone SSO</span>
            </button>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Request Access
              </Link>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>By signing in, you agree to Vodafone's</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Terms of Service
              </a>
              <span className="text-slate-700">|</span>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Global animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
