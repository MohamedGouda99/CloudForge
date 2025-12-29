import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Code,
  DollarSign,
  GitBranch,
  Users,
  Layers,
  Play,
  CheckCircle2,
  Sparkles,
  Cloud,
  Cpu,
  Database,
  Network,
  Terminal,
  Rocket,
  TrendingUp,
  Globe,
  Lock,
  Zap,
  Server,
  HardDrive,
  Settings,
  ChevronRight,
  MousePointer2,
  Award
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

// Technical color palette - blues, teals, grays
const colors = {
  vodafone: '#E60000',
  primary: '#0EA5E9',    // Sky blue
  secondary: '#06B6D4',  // Cyan
  accent: '#3B82F6',     // Blue
  success: '#10B981',    // Emerald
  warning: '#F59E0B',    // Amber
  dark: '#0F172A',       // Slate 900
  darker: '#020617',     // Slate 950
};

// Animated gradient background - technical blues
const AnimatedGradientBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-40"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 20% 40%, rgba(14, 165, 233, 0.2), transparent),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(6, 182, 212, 0.15), transparent),
          radial-gradient(ellipse 70% 50% at 50% 80%, rgba(59, 130, 246, 0.15), transparent)
        `,
      }}
    />
  </div>
);

// Floating particles - technical blue tones
const TechParticles = () => {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 10,
      color: [
        'rgba(14, 165, 233, 0.5)',
        'rgba(6, 182, 212, 0.5)',
        'rgba(59, 130, 246, 0.4)',
        'rgba(16, 185, 129, 0.4)',
      ][Math.floor(Math.random() * 4)],
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
          50% { transform: translateY(-30px) translateX(15px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

// Tech grid pattern
const TechGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.15]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
);

// Magic Cursor Effect - Mix Blend Mode Spotlight
const TechCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringText, setIsHoveringText] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      // Smooth follow with easing
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.15;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Arrow follows mouse directly (no lag)
      if (arrowRef.current) {
        arrowRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);

      const target = e.target as HTMLElement;

      // Check for clickable elements (buttons, links)
      const clickable = target.closest('a, button, [role="button"], input[type="submit"]');
      setIsHoveringClickable(!!clickable);

      // Check for text elements (only if not clickable)
      if (!clickable) {
        const textElement = target.closest('h1, h2, h3, h4, p, span, [data-cursor]');
        setIsHoveringText(!!textElement);
      } else {
        setIsHoveringText(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animationId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Custom teal hand pointer cursor as data URI
  const simpleHandSvg = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#14b8a6" stroke="#0f766e" stroke-width="1" d="M12 1a2 2 0 0 0-2 2v6.5a.5.5 0 0 1-1 0V4a2 2 0 0 0-4 0v8a.5.5 0 0 1-.85.35l-1.29-1.29a2 2 0 0 0-2.83 2.83l4.24 4.24A8 8 0 0 0 20 14V7a2 2 0 0 0-4 0v2.5a.5.5 0 0 1-1 0V4a2 2 0 0 0-4 0v5.5a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/></svg>`)}`;

  // Show native pointer for clickable elements, hide default cursor otherwise
  const cursorStyle = isHoveringClickable
    ? `* { cursor: default !important; } a, button, [role="button"], input[type="submit"] { cursor: url('${simpleHandSvg}') 6 0, pointer !important; }`
    : `* { cursor: none !important; }`;

  return (
    <>
      <style>{cursorStyle}</style>

      {/* Custom arrow pointer - hidden when hovering text or clickable */}
      <div
        ref={arrowRef}
        className={`fixed top-0 left-0 pointer-events-none z-[10000] transition-opacity duration-200 ${
          isVisible && !isHoveringText && !isHoveringClickable ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.86 2.86a.5.5 0 0 0-.36.35z"
            fill="#14b8a6"
            stroke="#0f766e"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Cursor circle with mix-blend-mode - hidden when hovering clickable */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200 ${
          isVisible && !isHoveringClickable ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          willChange: 'transform',
          mixBlendMode: 'difference',
        }}
      >
        {/* Main cursor circle */}
        <div
          className="rounded-full transition-all duration-300 ease-out"
          style={{
            width: isHoveringText ? '80px' : '12px',
            height: isHoveringText ? '80px' : '12px',
            backgroundColor: '#ffffff',
            marginLeft: isHoveringText ? '-40px' : '-6px',
            marginTop: isHoveringText ? '-40px' : '-6px',
          }}
        />
      </div>
    </>
  );
};

// Fixed Typing animation component
const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 1500);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isTyping, text]);

  return (
    <span>
      {displayText}
      {showCursor && <span className="animate-pulse text-cyan-400">|</span>}
    </span>
  );
};

// Animated counter
const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Animated section
const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translate-y-12';
      case 'down': return '-translate-y-12';
      case 'left': return 'translate-x-12';
      case 'right': return '-translate-x-12';
      default: return 'translate-y-12';
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${getTransform()}`
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Technical feature card
const FeatureCard = ({ icon: Icon, title, description, accentColor }: {
  icon: any;
  title: string;
  description: string;
  accentColor: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-sm h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 20px 40px -20px ${accentColor}30` : 'none',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-all duration-300"
        style={{
          background: isHovered ? `linear-gradient(90deg, transparent, ${accentColor}, transparent)` : 'transparent',
        }}
      />

      <div className="relative z-10 flex flex-col flex-1">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed flex-1">{description}</p>
      </div>
    </div>
  );
};

// Stats card
const StatCard = ({ value, label, suffix = '', icon: Icon, accentColor }: {
  value: number;
  label: string;
  suffix?: string;
  icon: any;
  accentColor: string;
}) => (
  <div className="group p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-sm text-center">
    <div className="flex justify-center mb-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">
      <AnimatedCounter end={value} suffix={suffix} />
    </div>
    <div className="text-slate-500 text-sm">{label}</div>
  </div>
);

// Integration card
const IntegrationCard = ({ name, imgSrc, description, accentColor }: {
  name: string;
  imgSrc: string;
  description: string;
  accentColor: string;
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div className="h-12 mb-4 flex items-center">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={name}
            className={`h-10 w-auto object-contain transition-all duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-white font-semibold text-lg">{name}</span>
        )}
      </div>
      <h3 className="text-white font-semibold mb-1">{name}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
};

// Christmas Snow Effect
const SnowEffect = () => {
  const [snowflakes] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 6 + 4,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.6 + 0.3,
      sway: Math.random() * 30 + 10,
    }))
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[100]">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white"
          style={{
            left: `${flake.x}%`,
            top: '-20px',
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            filter: 'blur(0.5px)',
            textShadow: '0 0 5px rgba(255,255,255,0.5)',
            ['--sway' as any]: `${flake.sway}px`,
          }}
        >
          ❄
        </div>
      ))}
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(var(--sway)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Floating tech icons
const FloatingIcons = () => {
  const icons = [
    { Icon: Cloud, x: 8, y: 18, delay: 0 },
    { Icon: Server, x: 88, y: 12, delay: 1 },
    { Icon: Database, x: 78, y: 72, delay: 2 },
    { Icon: Network, x: 12, y: 78, delay: 1.5 },
    { Icon: Terminal, x: 92, y: 48, delay: 0.5 },
    { Icon: Lock, x: 5, y: 48, delay: 2.5 },
    { Icon: HardDrive, x: 50, y: 8, delay: 3 },
    { Icon: Cpu, x: 45, y: 88, delay: 2 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, x, y, delay }, i) => (
        <div
          key={i}
          className="absolute text-cyan-500/20"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animation: `floatIcon 12s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        >
          <Icon className="w-6 h-6" />
        </div>
      ))}
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

// Process step
const ProcessStep = ({ step, title, description, icon: Icon, isLast = false }: {
  step: string;
  title: string;
  description: string;
  icon: any;
  isLast?: boolean;
}) => (
  <div className="relative group">
    {!isLast && (
      <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[1px] bg-gradient-to-r from-slate-700 to-transparent z-0" />
    )}

    <div className="relative z-10 text-center">
      <div className="relative inline-block mb-5">
        <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center transition-all duration-300 group-hover:border-cyan-500/50 group-hover:bg-slate-800/80">
          <Icon className="w-9 h-9 text-cyan-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-white">
          {step}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">{description}</p>
    </div>
  </div>
);

export default function VodafoneLandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Christmas Snow Effect */}
      <SnowEffect />

      {/* Technical Cursor */}
      <TechCursor />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50
          ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                <img
                  src="/vodafone.png"
                  alt="Vodafone"
                  className="h-7 w-auto object-contain"
                  onError={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.innerHTML = '<span class="text-red-600 font-bold text-xl">V</span>';
                  }}
                />
              </div>
              <div>
                <span className="text-lg font-bold text-white">CloudForge</span>
                <span className="text-[10px] text-slate-500 block -mt-0.5">by Vodafone</span>
              </div>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How it Works', 'Integrations', 'Security'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-1"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <AnimatedGradientBackground />
        <TechParticles />
        <TechGrid />
        <FloatingIcons />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className={`mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">AI-Powered Infrastructure Design</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>

            {/* Headline */}
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="text-white">Design & Deploy</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
                {isLoaded ? <TypingText text="Cloud Infrastructure" delay={500} /> : null}
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              The AI-driven platform to <span className="text-cyan-400">visually design</span>,{' '}
              <span className="text-sky-400">generate Terraform</span>, and{' '}
              <span className="text-emerald-400">manage infrastructure</span> collaboratively.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-lg text-white bg-red-600 hover:bg-red-500 transition-all duration-300 hover:scale-105"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-lg text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-300">
                <Play className="w-5 h-5 text-cyan-400" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <StatCard value={500} suffix="+" label="Enterprise Teams" icon={Users} accentColor={colors.primary} />
              <StatCard value={10} suffix="k+" label="Deployments" icon={Rocket} accentColor={colors.secondary} />
              <StatCard value={99} suffix="%" label="Uptime" icon={TrendingUp} accentColor={colors.success} />
              <StatCard value={50} suffix="+" label="Integrations" icon={Globe} accentColor={colors.accent} />
            </div>

            {/* Cloud providers */}
            <div className={`mt-16 mb-20 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-slate-500 text-sm mb-6">Trusted by teams deploying to</p>
              <div className="flex items-center justify-center gap-8">
                {[
                  { src: '/cloud_logos/aws.png', alt: 'AWS' },
                  { src: '/cloud_logos/azure.png', alt: 'Azure' },
                  { src: '/cloud_logos/gcp.png', alt: 'Google Cloud' },
                ].map((cloud) => (
                  <div
                    key={cloud.alt}
                    className="bg-white rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <img src={cloud.src} alt={cloud.alt} className="h-8 w-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll indicator */}
            <div className={`transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <MousePointer2 className="w-5 h-5 animate-bounce" />
                <span className="text-xs">Scroll to explore</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Everything you need to</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">build great infrastructure</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From visual design to deployment, CloudForge provides a complete IaC solution.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Layers, title: 'Visual Designer', description: 'Drag and drop cloud resources to design your infrastructure visually.', accentColor: colors.primary },
              { icon: Code, title: 'Auto Terraform', description: 'Automatically generate production-ready Terraform code from designs.', accentColor: colors.secondary },
              { icon: DollarSign, title: 'Cost Estimation', description: 'Get real-time cost estimates with Infracost before deployment.', accentColor: colors.success },
              { icon: Shield, title: 'Security Scanning', description: 'Scan infrastructure for vulnerabilities with TFSec and Terrascan.', accentColor: colors.warning },
              { icon: GitBranch, title: 'Git Integration', description: 'Seamless version control with GitHub, GitLab, and Bitbucket.', accentColor: colors.accent },
              { icon: Users, title: 'Team Collaboration', description: 'Real-time collaboration with role-based access control.', accentColor: colors.primary },
            ].map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 80} className="h-full">
                <FeatureCard {...feature} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm mb-4">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">How it</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Works</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Get started in minutes with our intuitive three-step workflow
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Design', description: 'Drag and drop cloud resources onto the canvas to design your infrastructure', icon: Layers },
              { step: '2', title: 'Generate', description: 'Click generate to create production-ready Terraform code automatically', icon: Code },
              { step: '3', title: 'Deploy', description: 'Review, download, and deploy your infrastructure with confidence', icon: Rocket },
            ].map((item, index) => (
              <AnimatedSection key={item.step} delay={index * 150}>
                <ProcessStep {...item} isLast={index === 2} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm mb-4">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">Integrations</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Powerful</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Integrations</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Centralize your tools. Optimize costs. Enhance security.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Infracost', imgSrc: '/cicd_icons/infracost.jpg', description: 'Cloud cost estimation for Terraform', accentColor: colors.success },
              { name: 'Terrascan', imgSrc: '/cicd_icons/terrascan.jpg', description: 'Policy as code for cloud security', accentColor: colors.primary },
              { name: 'TFSec', imgSrc: '/cicd_icons/tfsec.jpg', description: 'Security scanner for Terraform', accentColor: colors.secondary },
            ].map((integration, index) => (
              <AnimatedSection key={integration.name} delay={index * 100}>
                <IntegrationCard {...integration} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm mb-4">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Security</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="text-white">Security &</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cost First</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Built-in security scanning and cost estimation from day one.
                Catch vulnerabilities before they reach production.
              </p>

              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, title: 'Security Best Practices', description: 'Automatic detection of security misconfigurations', color: colors.success },
                  { icon: Award, title: 'Compliance Policies', description: 'Enforce organizational policies before deployment', color: colors.primary },
                  { icon: DollarSign, title: 'Cost Optimization', description: 'Real-time cost estimation before deployment', color: colors.secondary },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 group">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150} direction="right">
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Security Scan Results</h3>
                  <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    All Passed
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'TFSec', img: '/cicd_icons/tfsec.jpg', result: '0 issues', color: colors.success },
                    { name: 'Terrascan', img: '/cicd_icons/terrascan.jpg', result: '0 violations', color: colors.success },
                    { name: 'Infracost', img: '/cicd_icons/infracost.jpg', result: '$124/mo', color: colors.primary },
                  ].map((tool) => (
                    <div key={tool.name} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src={tool.img} alt={tool.name} className="h-6 w-auto rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <span className="text-slate-300">{tool.name}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: tool.color }}>{tool.result}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full w-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    style={{ animation: 'scanLine 3s ease-in-out infinite' }}
                  />
                </div>
                <style>{`
                  @keyframes scanLine {
                    0%, 100% { transform: translateX(-70%); }
                    50% { transform: translateX(70%); }
                  }
                `}</style>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-white">Ready to build</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">something great?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join hundreds of enterprise teams already using CloudForge to design, deploy, and manage their cloud infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-medium text-lg text-white bg-red-600 hover:bg-red-500 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-medium text-lg text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <img
                    src="/vodafone.png"
                    alt="V"
                    className="h-5 w-auto object-contain"
                    onError={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.innerHTML = '<span class="text-red-600 font-bold text-sm">V</span>';
                    }}
                  />
                </div>
                <span className="text-white font-bold">CloudForge</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                AI-driven platform to visually design and manage cloud infrastructure.
              </p>
            </div>

            {[
              { title: 'Quick Links', links: [{ name: 'Free Sign Up', path: '/register' }, { name: 'Sign In', path: '/login' }, { name: 'Documentation', path: '#' }] },
              { title: 'Legal', links: [{ name: 'Terms of Service', path: '#' }, { name: 'Privacy Policy', path: '#' }, { name: 'GDPR', path: '#' }] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-slate-400 hover:text-white transition-colors text-sm">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Cloud Providers</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { src: '/cloud_logos/aws.png', alt: 'AWS' },
                  { src: '/cloud_logos/azure.png', alt: 'Azure' },
                  { src: '/cloud_logos/gcp.png', alt: 'GCP' },
                ].map((cloud) => (
                  <div key={cloud.alt} className="bg-white rounded-lg p-2 hover:scale-105 transition-transform cursor-pointer">
                    <img src={cloud.src} alt={cloud.alt} className="h-5 w-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">©2025 Vodafone CloudForge. All rights reserved.</p>
            <p className="text-slate-500 text-sm">Built by Vodafone Engineering</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
