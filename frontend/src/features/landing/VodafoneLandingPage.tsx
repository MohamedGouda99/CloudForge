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
  Lock,
  Eye,
  Zap
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

// Animated text component
const AnimatedText = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span className={`inline-block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {children}
    </span>
  );
};

// Animated section component
const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
};

// Feature card
const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="group p-6 rounded-2xl bg-[#111118] border border-white/5 hover:border-red-500/30 transition-all duration-300 hover:bg-[#16161f]">
    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
      <Icon className="w-6 h-6 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

// Integration tool card with image
const IntegrationCard = ({ name, imgSrc, description }: { name: string; imgSrc: string; description: string }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  return (
    <div className="group p-6 rounded-2xl bg-[#111118] border border-white/5 hover:border-white/20 transition-all duration-300">
      <div className="h-12 mb-4 flex items-center">
        {!imgError ? (
          <img 
            src={imgSrc} 
            alt={name}
            className={`h-10 w-auto object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-white font-semibold text-lg">{name}</span>
        )}
      </div>
      <h3 className="text-white font-semibold mb-1">{name}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default function VodafoneLandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/90 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                <span className="text-lg font-bold text-white">CloudForge</span>
                <span className="text-[10px] text-gray-500 block -mt-0.5">by Vodafone</span>
              </div>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
              <a href="#integrations" className="text-gray-400 hover:text-white transition-colors text-sm">Integrations</a>
              <a href="#security" className="text-gray-400 hover:text-white transition-colors text-sm">Security</a>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Sparkles className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-300">AI-Powered Infrastructure Design</span>
            </div>

            {/* Headline */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Design and manage your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
                cloud infrastructure
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              CloudForge is an AI driven platform to visually design, generate Terraform code and manage cloud infrastructure, collaboratively.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-xl font-medium text-lg transition-all duration-200 group"
              >
                Start for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-medium text-lg border border-white/10 transition-all duration-200">
                <Play className="w-5 h-5" />
                Watch demo
              </button>
            </div>

            {/* Cloud providers */}
            <div className={`mt-16 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-gray-500 text-sm mb-4">Works with all major cloud providers</p>
              <div className="flex items-center justify-center gap-6">
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img src="/cloud_logos/aws.png" alt="AWS" className="h-8 w-auto" />
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img src="/cloud_logos/azure.png" alt="Azure" className="h-8 w-auto" />
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img src="/cloud_logos/gcp.png" alt="Google Cloud" className="h-8 w-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to build
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400"> great things</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From visual design to deployment, CloudForge provides a complete solution for infrastructure as code.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatedSection delay={0}>
              <FeatureCard
                icon={Layers}
                title="Visual Designer"
                description="Drag and drop cloud resources to design your infrastructure visually. No manual coding required."
              />
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <FeatureCard
                icon={Code}
                title="Auto Terraform Generation"
                description="Automatically generate production-ready Terraform code from your visual designs."
              />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <FeatureCard
                icon={DollarSign}
                title="Cost Estimation"
                description="Get real-time cost estimates with Infracost integration before you deploy."
              />
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <FeatureCard
                icon={Shield}
                title="Security Scanning"
                description="Scan your infrastructure for security vulnerabilities with TFSec and Terrascan."
              />
            </AnimatedSection>
            <AnimatedSection delay={400}>
              <FeatureCard
                icon={GitBranch}
                title="Git Integration"
                description="Seamless version control with GitHub, GitLab, and Bitbucket integration."
              />
            </AnimatedSection>
            <AnimatedSection delay={500}>
              <FeatureCard
                icon={Users}
                title="Team Collaboration"
                description="Real-time collaboration with role-based access control for enterprise teams."
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 bg-[#0c0c10]">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Integrations</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Centralize & consolidate your tools. Optimize costs and enhance security.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimatedSection delay={0}>
              <IntegrationCard
                name="Infracost"
                imgSrc="/cicd_icons/infracost.jpg"
                description="Cloud cost estimation for Terraform"
              />
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <IntegrationCard
                name="Terrascan"
                imgSrc="/cicd_icons/terrascan.jpg"
                description="Policy as code for cloud security"
              />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <IntegrationCard
                name="TFSec"
                imgSrc="/cicd_icons/tfsec.jpg"
                description="Security scanner for Terraform"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Security & Cost
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400"> First</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Built-in security scanning and cost estimation from day one. 
                Catch vulnerabilities before they reach production.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Security Best Practices</h4>
                    <p className="text-gray-400 text-sm">Automatic detection of security misconfigurations</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Compliance Policies</h4>
                    <p className="text-gray-400 text-sm">Enforce organizational policies before deployment</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Cost Optimization</h4>
                    <p className="text-gray-400 text-sm">Real-time cost estimation before deployment</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="bg-[#111118] rounded-2xl p-8 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Security Scan Results</h3>
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/20">All Passed</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src="/cicd_icons/tfsec.jpg" alt="TFSec" className="h-6 w-auto rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
                      <span className="text-gray-300">TFSec</span>
                    </div>
                    <span className="text-green-400 text-sm">0 issues</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src="/cicd_icons/terrascan.jpg" alt="Terrascan" className="h-6 w-auto rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
                      <span className="text-gray-300">Terrascan</span>
                    </div>
                    <span className="text-green-400 text-sm">0 violations</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src="/cicd_icons/infracost.jpg" alt="Infracost" className="h-6 w-auto rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
                      <span className="text-gray-300">Infracost</span>
                    </div>
                    <span className="text-blue-400 text-sm">$124/mo</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0c0c10]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              It's up to you now to build great things.
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join hundreds of enterprise teams already using CloudForge to design, deploy, and manage their cloud infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-xl font-medium text-lg transition-all duration-200 group"
              >
                Start for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-medium text-lg border border-white/10 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
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
                <span className="text-white font-bold">CloudForge</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                AI-driven platform to visually design and manage cloud infrastructure.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Free Sign Up</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Sign In</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">GDPR</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Cloud Providers</h4>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white rounded-lg p-2 hover:scale-105 transition-all duration-300">
                  <img src="/cloud_logos/aws.png" alt="AWS" className="h-5 w-auto" />
                </div>
                <div className="bg-white rounded-lg p-2 hover:scale-105 transition-all duration-300">
                  <img src="/cloud_logos/azure.png" alt="Azure" className="h-5 w-auto" />
                </div>
                <div className="bg-white rounded-lg p-2 hover:scale-105 transition-all duration-300">
                  <img src="/cloud_logos/gcp.png" alt="GCP" className="h-5 w-auto" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">©2025 - Vodafone CloudForge</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
