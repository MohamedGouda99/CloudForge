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
  Award,
  Sun,
  Moon
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';

// Theme Context
const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({
  isDark: true,
  toggleTheme: () => {},
});

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
const FeatureCard = ({ icon: Icon, title, description, accentColor, isDark = true }: {
  icon: any;
  title: string;
  description: string;
  accentColor: string;
  isDark?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative p-6 rounded-xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200 shadow-sm'} border transition-all duration-500 backdrop-blur-sm h-full flex flex-col overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? `0 25px 50px -12px ${accentColor}40, 0 0 30px ${accentColor}20`
          : isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
        borderColor: isHovered ? `${accentColor}50` : undefined,
      }}
    >
      {/* Animated gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accentColor}15, transparent 70%)`,
        }}
      />

      {/* Top accent line with glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-all duration-500"
        style={{
          background: isHovered ? `linear-gradient(90deg, transparent, ${accentColor}, transparent)` : 'transparent',
          boxShadow: isHovered ? `0 0 20px ${accentColor}` : 'none',
        }}
      />

      {/* Corner decorations */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${accentColor}20, transparent 70%)`,
        }}
      />

      {/* Floating particles on hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-0 group-hover:opacity-100"
            style={{
              backgroundColor: accentColor,
              left: `${15 + i * 18}%`,
              bottom: '10%',
              animation: isHovered ? `particle-rise ${1.5 + i * 0.2}s ease-out infinite` : 'none',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Icon with glow effect */}
        <div className="relative mb-4">
          <div
            className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="relative w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110"
            style={{
              background: isHovered ? `${accentColor}25` : `${accentColor}15`,
              border: `1px solid ${isHovered ? accentColor : `${accentColor}30`}`,
              boxShadow: isHovered ? `0 0 20px ${accentColor}40` : 'none',
            }}
          >
            <Icon
              className="w-6 h-6 transition-transform duration-500 group-hover:scale-110"
              style={{ color: accentColor }}
            />
          </div>
        </div>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 transition-colors duration-300`}>{title}</h3>
        <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} text-sm leading-relaxed flex-1`}>{description}</p>

        {/* Learn more indicator */}
        <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="text-xs font-medium" style={{ color: accentColor }}>Learn more</span>
          <ChevronRight className="w-3 h-3" style={{ color: accentColor }} />
        </div>
      </div>

      <style>{`
        @keyframes particle-rise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-60px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Stats card
const StatCard = ({ value, label, suffix = '', icon: Icon, accentColor, isDark = true }: {
  value: number;
  label: string;
  suffix?: string;
  icon: any;
  accentColor: string;
  isDark?: boolean;
}) => (
  <div className={`group relative p-5 rounded-xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200 shadow-sm'} border transition-all duration-500 backdrop-blur-sm text-center overflow-hidden hover:scale-105`}
    style={{
      boxShadow: `0 0 0 0 ${accentColor}00`,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = `0 0 30px ${accentColor}30, 0 10px 40px -10px ${accentColor}20`;
      e.currentTarget.style.borderColor = `${accentColor}50`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = `0 0 0 0 ${accentColor}00`;
      e.currentTarget.style.borderColor = '';
    }}
  >
    {/* Background glow */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${accentColor}10, transparent 70%)`,
      }}
    />

    {/* Animated ring */}
    <div
      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        border: `1px solid ${accentColor}30`,
        animation: 'pulse-border 2s ease-in-out infinite',
      }}
    />

    <div className="relative z-10">
      <div className="flex justify-center mb-3">
        <div className="relative">
          {/* Icon glow */}
          <div
            className="absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110"
            style={{
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            <Icon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" style={{ color: accentColor }} />
          </div>
        </div>
      </div>
      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
        <AnimatedCounter end={value} suffix={suffix} />
      </div>
      <div className={`${isDark ? 'text-slate-500' : 'text-gray-500'} text-sm`}>{label}</div>
    </div>

    <style>{`
      @keyframes pulse-border {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.02); opacity: 0.8; }
      }
    `}</style>
  </div>
);

// Integration card
const IntegrationCard = ({ name, imgSrc, description, accentColor, isDark = true }: {
  name: string;
  imgSrc: string;
  description: string;
  accentColor: string;
  isDark?: boolean;
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative p-6 rounded-xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200 shadow-sm'} border transition-all duration-500 backdrop-blur-sm overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered ? `0 20px 40px -15px ${accentColor}30, 0 0 30px ${accentColor}15` : 'none',
        borderColor: isHovered ? `${accentColor}50` : undefined,
      }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 50%, ${accentColor}05 100%)`,
        }}
      />

      {/* Scanning line effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="absolute w-full h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            animation: isHovered ? 'scan-vertical 2s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${accentColor}25, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="h-14 mb-4 flex items-center">
          {!imgError ? (
            <div className="relative">
              {/* Image glow */}
              <div
                className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{ backgroundColor: accentColor }}
              />
              <img
                src={imgSrc}
                alt={name}
                className={`relative h-12 w-auto object-contain transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-110`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold text-lg`}>{name}</span>
          )}
        </div>
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-2`}>{name}</h3>
        <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} text-sm`}>{description}</p>

        {/* Status indicator */}
        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-500">Connected</span>
        </div>
      </div>

      <style>{`
        @keyframes scan-vertical {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
};

// Christmas Snow Effect
const SnowEffect = () => {
  const { isDark } = useContext(ThemeContext);
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
          className={`absolute ${isDark ? 'text-white' : 'text-cyan-500'}`}
          style={{
            left: `${flake.x}%`,
            top: '-20px',
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            filter: 'blur(0.5px)',
            textShadow: isDark ? '0 0 5px rgba(255,255,255,0.5)' : '0 0 5px rgba(6,182,212,0.5)',
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
const ProcessStep = ({ step, title, description, icon: Icon, isLast = false, isDark = true }: {
  step: string;
  title: string;
  description: string;
  icon: any;
  isLast?: boolean;
  isDark?: boolean;
}) => (
  <div className="relative group">
    {/* Animated connection line */}
    {!isLast && (
      <div className="hidden md:block absolute top-10 left-[calc(50%+50px)] w-[calc(100%-100px)] z-0">
        <div className={`h-[2px] ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
        <div
          className="absolute top-0 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent"
          style={{
            animation: 'flow-line 3s ease-in-out infinite',
            width: '50%',
          }}
        />
        {/* Animated dots along the line */}
        <div className="absolute top-[-3px] left-[25%] w-2 h-2 rounded-full bg-cyan-500 opacity-60" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
        <div className="absolute top-[-3px] left-[50%] w-2 h-2 rounded-full bg-cyan-500 opacity-40" style={{ animation: 'pulse-dot 2s ease-in-out infinite 0.5s' }} />
        <div className="absolute top-[-3px] left-[75%] w-2 h-2 rounded-full bg-cyan-500 opacity-20" style={{ animation: 'pulse-dot 2s ease-in-out infinite 1s' }} />
      </div>
    )}

    <div className="relative z-10 text-center">
      <div className="relative inline-block mb-5">
        {/* Glow effect behind icon */}
        <div
          className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500"
          style={{ backgroundColor: '#06B6D4' }}
        />

        {/* Main icon container */}
        <div
          className={`relative w-20 h-20 rounded-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-md'} border-2 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-cyan-500 overflow-hidden`}
          style={{
            boxShadow: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px rgba(6, 182, 212, 0.4), 0 10px 40px -10px rgba(6, 182, 212, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Rotating ring on hover */}
          <div
            className="absolute inset-2 rounded-lg border border-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ animation: 'rotate-slow 10s linear infinite' }}
          />

          <Icon className="relative z-10 w-9 h-9 text-cyan-500 transition-transform duration-500 group-hover:scale-110" />
        </div>

        {/* Step number badge */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{step}</span>
        </div>

        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-xl border-2 border-cyan-500 opacity-0 group-hover:opacity-100"
          style={{ animation: 'pulse-ring-step 1.5s ease-out infinite' }}
        />
      </div>

      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 transition-colors duration-300 group-hover:text-cyan-400`}>{title}</h3>
      <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} text-sm max-w-xs mx-auto`}>{description}</p>
    </div>

    <style>{`
      @keyframes flow-line {
        0% { left: 0%; opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { left: 50%; opacity: 0; }
      }
      @keyframes pulse-dot {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.5); opacity: 0.8; }
      }
      @keyframes rotate-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse-ring-step {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.3); opacity: 0; }
      }
    `}</style>
  </div>
);

export default function VodafoneLandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('cloudforge-theme');
    return saved ? saved === 'dark' : true;
  });

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('cloudforge-theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme-aware class helpers
  const bg = isDark ? 'bg-slate-950' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-slate-900/50' : 'bg-white';
  const bgCardSolid = isDark ? 'bg-slate-900' : 'bg-white';
  const bgNav = isDark ? 'bg-slate-950/95' : 'bg-white/95';
  const bgSection = isDark ? 'bg-slate-900/50' : 'bg-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-500';
  const border = isDark ? 'border-slate-800' : 'border-gray-200';
  const borderHover = isDark ? 'hover:border-slate-700' : 'hover:border-gray-300';
  const btnSecondary = isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-gray-100 hover:bg-gray-200 border-gray-200';
  const badge = isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200 shadow-sm';

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
    <div className={`min-h-screen ${bg} ${textPrimary} overflow-x-hidden transition-colors duration-300`}>
      {/* Christmas Snow Effect */}
      <SnowEffect />

      {/* Technical Cursor */}
      <TechCursor />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50
          ? `${bgNav} backdrop-blur-xl border-b ${border}`
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
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
                <span className={`text-lg font-bold ${textPrimary}`}>CloudForge</span>
                <span className={`text-[10px] ${textMuted} block -mt-0.5`}>by Vodafone</span>
              </div>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How it Works', 'Integrations', 'Security'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className={`${textSecondary} hover:${textPrimary} transition-colors text-sm`}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Auth buttons + Theme Toggle */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>

              <Link to="/login" className={`${textSecondary} hover:${textPrimary} transition-colors text-sm font-medium`}>
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
        {isDark && <AnimatedGradientBackground />}
        {isDark && <TechParticles />}
        {isDark && <TechGrid />}
        {isDark && <FloatingIcons />}
        {!isDark && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              background: 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(14, 165, 233, 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(6, 182, 212, 0.1), transparent)'
            }} />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className={`mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badge} border text-sm`}>
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span className={textSecondary}>AI-Powered Infrastructure Design</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>

            {/* Headline */}
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className={textPrimary}>Design & Deploy</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600">
                {isLoaded ? <TypingText text="Cloud Infrastructure" delay={500} /> : null}
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-lg md:text-xl ${textSecondary} mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              The AI-driven platform to <span className="text-cyan-500">visually design</span>,{' '}
              <span className="text-sky-500">generate Terraform</span>, and{' '}
              <span className="text-emerald-500">manage infrastructure</span> collaboratively.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-lg text-white bg-red-600 hover:bg-red-500 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-lg ${textPrimary} ${btnSecondary} border transition-all duration-300`}>
                <Play className="w-5 h-5 text-cyan-500" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <StatCard value={500} suffix="+" label="Enterprise Teams" icon={Users} accentColor={colors.primary} isDark={isDark} />
              <StatCard value={10} suffix="k+" label="Deployments" icon={Rocket} accentColor={colors.secondary} isDark={isDark} />
              <StatCard value={99} suffix="%" label="Uptime" icon={TrendingUp} accentColor={colors.success} isDark={isDark} />
              <StatCard value={50} suffix="+" label="Integrations" icon={Globe} accentColor={colors.accent} isDark={isDark} />
            </div>

            {/* Cloud providers - Creative Display */}
            <div className={`mt-16 mb-20 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className={`${textMuted} text-sm mb-8`}>Trusted by teams deploying to</p>

              {/* Orbital Cloud Display */}
              <div className="relative flex items-center justify-center">
                {/* Connection lines */}
                <svg className="absolute w-[400px] h-[200px] pointer-events-none" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF9900" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0078D4" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0078D4" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#EA4335" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  {/* Animated connection paths */}
                  <path
                    d="M 80 100 Q 200 60 320 100"
                    fill="none"
                    stroke="url(#lineGradient1)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    className="animate-pulse"
                  />
                  <path
                    d="M 80 100 Q 200 140 320 100"
                    fill="none"
                    stroke="url(#lineGradient2)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    className="animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                  {/* Center glow */}
                  <circle cx="200" cy="100" r="30" fill="url(#lineGradient1)" opacity="0.1">
                    <animate attributeName="r" values="25;35;25" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite" />
                  </circle>
                </svg>

                {/* Cloud Provider Cards */}
                <div className="relative flex items-center justify-center gap-6 md:gap-12">
                  {[
                    { src: '/cloud_logos/aws.png', alt: 'AWS', color: '#FF9900', glow: 'rgba(255,153,0,0.4)', desc: 'Amazon Web Services', parallaxY: 0.08, parallaxX: -0.03 },
                    { src: '/cloud_logos/azure.png', alt: 'Azure', color: '#0078D4', glow: 'rgba(0,120,212,0.4)', desc: 'Microsoft Azure', parallaxY: -0.05, parallaxX: 0 },
                    { src: '/cloud_logos/gcp.png', alt: 'Google Cloud', color: '#EA4335', glow: 'rgba(234,67,53,0.4)', desc: 'Google Cloud Platform', parallaxY: 0.1, parallaxX: 0.03 },
                  ].map((cloud, index) => (
                    <div
                      key={cloud.alt}
                      className="group relative will-change-transform"
                      style={{
                        animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                        animationDelay: `${index * 0.3}s`,
                        transform: `translate3d(${scrollY * cloud.parallaxX}px, ${scrollY * cloud.parallaxY}px, 0)`,
                      }}
                    >
                      {/* Glow effect */}
                      <div
                        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"
                        style={{ background: cloud.glow }}
                      />

                      {/* Card */}
                      <div
                        className={`relative ${isDark ? 'bg-slate-900/80' : 'bg-white'} backdrop-blur-sm rounded-2xl p-5 border-2 transition-all duration-500 cursor-pointer group-hover:scale-110 group-hover:-translate-y-2`}
                        style={{
                          borderColor: isDark ? `${cloud.color}40` : `${cloud.color}30`,
                          boxShadow: isDark
                            ? `0 0 20px ${cloud.glow}, inset 0 0 20px ${cloud.color}10`
                            : `0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px ${cloud.color}20`,
                        }}
                      >
                        {/* Animated border */}
                        <div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${cloud.color}40, transparent)`,
                            animation: 'shimmer 2s infinite',
                          }}
                        />

                        <div className="relative z-10 flex flex-col items-center">
                          <img
                            src={cloud.src}
                            alt={cloud.alt}
                            className="h-10 w-auto mb-2 transition-transform duration-300 group-hover:scale-110"
                          />
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'} opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}>
                            {cloud.desc}
                          </span>
                        </div>

                        {/* Pulse ring */}
                        <div
                          className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100"
                          style={{
                            borderColor: cloud.color,
                            animation: 'pulse-ring 1.5s ease-out infinite',
                          }}
                        />
                      </div>

                      {/* Floating particles */}
                      <div className="absolute -inset-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: cloud.color,
                              left: `${20 + i * 20}%`,
                              top: `${10 + (i % 2) * 80}%`,
                              animation: `particle-float ${2 + i * 0.3}s ease-in-out infinite`,
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyframe animations */}
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
                @keyframes pulse-ring {
                  0% { transform: scale(1); opacity: 0.5; }
                  100% { transform: scale(1.3); opacity: 0; }
                }
                @keyframes particle-float {
                  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
                  50% { transform: translateY(-15px) scale(1.2); opacity: 1; }
                }
              `}</style>
            </div>

            {/* Scroll indicator */}
            <div className={`transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <div className={`flex flex-col items-center gap-2 ${textMuted}`}>
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
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badge} border text-sm mb-4`}>
              <Zap className="w-4 h-4 text-cyan-500" />
              <span className={textSecondary}>Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className={textPrimary}>Everything you need to</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">build great infrastructure</span>
            </h2>
            <p className={`${textSecondary} text-lg max-w-2xl mx-auto`}>
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
                <FeatureCard {...feature} isDark={isDark} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className={`py-24 ${bgSection}`}>
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badge} border text-sm mb-4`}>
              <Settings className="w-4 h-4 text-cyan-500" />
              <span className={textSecondary}>Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className={textPrimary}>How it</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Works</span>
            </h2>
            <p className={`${textSecondary} text-lg max-w-2xl mx-auto`}>
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
                <ProcessStep {...item} isLast={index === 2} isDark={isDark} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badge} border text-sm mb-4`}>
              <Globe className="w-4 h-4 text-cyan-500" />
              <span className={textSecondary}>Integrations</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className={textPrimary}>Powerful</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Integrations</span>
            </h2>
            <p className={`${textSecondary} text-lg max-w-2xl mx-auto`}>
              Centralize your tools. Optimize costs. Enhance security.
            </p>
          </AnimatedSection>

          {/* Integration Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Infracost',
                imgSrc: '/cicd_icons/infracost.jpg',
                description: 'Cloud cost estimation for Terraform',
                color: '#10B981',
                glow: 'rgba(16, 185, 129, 0.4)',
                features: ['Real-time estimates', 'PR comments', 'Cost policies'],
                stat: '$2.4M',
                statLabel: 'Saved monthly',
              },
              {
                name: 'Terrascan',
                imgSrc: '/cicd_icons/terrascan.jpg',
                description: 'Policy as code for cloud security',
                color: '#0EA5E9',
                glow: 'rgba(14, 165, 233, 0.4)',
                features: ['500+ policies', 'Multi-cloud', 'CI/CD ready'],
                stat: '99.9%',
                statLabel: 'Compliance rate',
              },
              {
                name: 'TFSec',
                imgSrc: '/cicd_icons/tfsec.jpg',
                description: 'Security scanner for Terraform',
                color: '#06B6D4',
                glow: 'rgba(6, 182, 212, 0.4)',
                features: ['Static analysis', 'Custom rules', 'Fast scans'],
                stat: '< 30s',
                statLabel: 'Scan time',
              },
            ].map((tool, index) => (
              <AnimatedSection key={tool.name} delay={index * 150}>
                <div className="group relative h-full">
                  {/* Glow effect */}
                  <div
                    className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"
                    style={{ background: tool.glow }}
                  />

                  {/* Card */}
                  <div
                    className={`relative h-full ${isDark ? 'bg-slate-900/80' : 'bg-white'} backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-500 overflow-hidden`}
                    style={{
                      borderColor: isDark ? `${tool.color}30` : `${tool.color}20`,
                      boxShadow: isDark ? `0 0 20px ${tool.glow}` : '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = `0 20px 40px -10px ${tool.glow}, 0 0 30px ${tool.color}20`;
                      e.currentTarget.style.borderColor = tool.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isDark ? `0 0 20px ${tool.glow}` : '0 4px 20px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = isDark ? `${tool.color}30` : `${tool.color}20`;
                    }}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(${tool.color} 1px, transparent 1px)`,
                        backgroundSize: '20px 20px',
                      }} />
                    </div>

                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${tool.color}, transparent)`,
                      }}
                    />

                    {/* Corner glow */}
                    <div
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle, ${tool.color}, transparent)` }}
                    />

                    <div className="relative z-10">
                      {/* Logo with glow */}
                      <div className="relative mb-5">
                        <div
                          className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-xl"
                          style={{ backgroundColor: tool.color }}
                        />
                        <div className={`relative w-16 h-16 ${isDark ? 'bg-slate-800' : 'bg-gray-50'} rounded-xl flex items-center justify-center overflow-hidden border ${isDark ? 'border-slate-700' : 'border-gray-200'} group-hover:border-transparent transition-all duration-500`}
                          style={{ boxShadow: `0 0 0 0 ${tool.color}` }}
                          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 15px ${tool.color}50`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0 0 ${tool.color}`; }}
                        >
                          <img
                            src={tool.imgSrc}
                            alt={tool.name}
                            className="w-10 h-10 object-contain transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold" style="color: ${tool.color}">${tool.name[0]}</span>`;
                            }}
                          />
                        </div>

                        {/* Orbiting dot */}
                        <div
                          className="absolute w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            backgroundColor: tool.color,
                            animation: 'orbit-small 3s linear infinite',
                            top: '50%',
                            left: '50%',
                          }}
                        />
                      </div>

                      {/* Title & Description */}
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{tool.name}</h3>
                      <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} text-sm mb-4`}>{tool.description}</p>

                      {/* Feature tags */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {tool.features.map((feature) => (
                          <span
                            key={feature}
                            className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-slate-800' : 'bg-gray-100'} transition-all duration-300`}
                            style={{ color: tool.color, border: `1px solid ${tool.color}30` }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Stat display */}
                      <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-bold" style={{ color: tool.color }}>{tool.stat}</div>
                            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{tool.statLabel}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tool.color }} />
                            <span className="text-xs" style={{ color: tool.color }}>Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scan line effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden pointer-events-none">
                      <div
                        className="absolute w-full h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${tool.color}, transparent)`,
                          animation: 'scan-down 2s ease-in-out infinite',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Integration animations */}
          <style>{`
            @keyframes orbit-small {
              from { transform: rotate(0deg) translateX(35px) rotate(0deg); }
              to { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
            }
            @keyframes scan-down {
              0% { top: -10%; }
              50% { top: 110%; }
              100% { top: -10%; }
            }
          `}</style>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className={`py-24 ${bgSection}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badge} border text-sm mb-4`}>
                <Shield className="w-4 h-4 text-cyan-500" />
                <span className={textSecondary}>Security</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className={textPrimary}>Security &</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Cost First</span>
              </h2>
              <p className={`${textSecondary} text-lg mb-8 leading-relaxed`}>
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
                      <h4 className={`${textPrimary} font-semibold mb-1`}>{item.title}</h4>
                      <p className={`${textSecondary} text-sm`}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150} direction="right">
              <div className={`rounded-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-lg'} border p-8`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`${textPrimary} font-semibold`}>Security Scan Results</h3>
                  <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    All Passed
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'TFSec', img: '/cicd_icons/tfsec.jpg', result: '0 issues', color: colors.success },
                    { name: 'Terrascan', img: '/cicd_icons/terrascan.jpg', result: '0 violations', color: colors.success },
                    { name: 'Infracost', img: '/cicd_icons/infracost.jpg', result: '$124/mo', color: colors.primary },
                  ].map((tool) => (
                    <div key={tool.name} className={`flex items-center justify-between p-4 ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg`}>
                      <div className="flex items-center gap-3">
                        <img src={tool.img} alt={tool.name} className="h-6 w-auto rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <span className={textSecondary}>{tool.name}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: tool.color }}>{tool.result}</span>
                    </div>
                  ))}
                </div>

                <div className={`mt-6 h-1 ${isDark ? 'bg-slate-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
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
      <section className="py-24 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div
            className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, #06B6D4, transparent)',
              top: '10%',
              left: '10%',
              animation: 'float-orb 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-48 h-48 rounded-full blur-3xl opacity-15"
            style={{
              background: 'radial-gradient(circle, #3B82F6, transparent)',
              bottom: '20%',
              right: '15%',
              animation: 'float-orb 10s ease-in-out infinite reverse',
            }}
          />
          <div
            className="absolute w-32 h-32 rounded-full blur-2xl opacity-10"
            style={{
              background: 'radial-gradient(circle, #10B981, transparent)',
              top: '50%',
              right: '30%',
              animation: 'float-orb 6s ease-in-out infinite',
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <AnimatedSection>
            {/* Decorative badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-8">
              <Rocket className="w-4 h-4 text-cyan-500" />
              <span className={`text-sm ${textSecondary}`}>Start your journey today</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className={textPrimary}>Ready to build</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-pulse">something great?</span>
            </h2>
            <p className={`${textSecondary} text-lg mb-10 max-w-2xl mx-auto`}>
              Join hundreds of enterprise teams already using CloudForge to design, deploy, and manage their cloud infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Primary CTA with glow */}
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-medium text-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 'shine 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
                {/* Glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-red-500" />
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {/* Secondary CTA */}
              <Link
                to="/login"
                className={`group relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-medium text-lg ${textPrimary} ${btnSecondary} border transition-all duration-300 hover:scale-105 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Sign In</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-12 opacity-60">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className={`text-xs ${textMuted}`}>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-500" />
                <span className={`text-xs ${textMuted}`}>End-to-end Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span className={`text-xs ${textMuted}`}>99.9% Uptime</span>
              </div>
            </div>
          </AnimatedSection>
        </div>

        <style>{`
          @keyframes float-orb {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, -20px) scale(1.1); }
          }
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${border}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
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
                <span className={`${textPrimary} font-bold`}>CloudForge</span>
              </div>
              <p className={`${textMuted} text-sm leading-relaxed`}>
                AI-driven platform to visually design and manage cloud infrastructure.
              </p>
            </div>

            {[
              { title: 'Quick Links', links: [{ name: 'Free Sign Up', path: '/register' }, { name: 'Sign In', path: '/login' }, { name: 'Documentation', path: '#' }] },
              { title: 'Legal', links: [{ name: 'Terms of Service', path: '#' }, { name: 'Privacy Policy', path: '#' }, { name: 'GDPR', path: '#' }] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className={`${textPrimary} font-semibold mb-4 text-sm`}>{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className={`${textSecondary} hover:${textPrimary} transition-colors text-sm`}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 className={`${textPrimary} font-semibold mb-4 text-sm`}>Cloud Providers</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { src: '/cloud_logos/aws.png', alt: 'AWS' },
                  { src: '/cloud_logos/azure.png', alt: 'Azure' },
                  { src: '/cloud_logos/gcp.png', alt: 'GCP' },
                ].map((cloud) => (
                  <div key={cloud.alt} className="bg-white rounded-lg p-2 hover:scale-105 transition-transform cursor-pointer shadow-sm">
                    <img src={cloud.src} alt={cloud.alt} className="h-5 w-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`pt-8 border-t ${border} flex flex-col md:flex-row justify-between items-center gap-4`}>
            <p className={`${textMuted} text-sm`}>©2025 Vodafone CloudForge. All rights reserved.</p>
            <p className={`${textMuted} text-sm`}>Built by Vodafone Engineering</p>
          </div>
        </div>
      </footer>
    </div>
    </ThemeContext.Provider>
  );
}
