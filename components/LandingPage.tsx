import React from 'react';
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  BarChart3, 
  MessageSquare,
  Globe,
  Mail,
  Phone,
  PlayCircle,
  Moon,
  Sun
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, theme, onToggleTheme }) => {
  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      description: "Perfect for small tutoring centers",
      features: [
        "Up to 100 scripts/month",
        "Standard AI Evaluation",
        "Basic Performance Analytics",
        "Email Support",
        "7-day History Retention"
      ],
      buttonText: "Get Started",
      highlight: false
    },
    {
      name: "Institutional",
      price: "$199",
      description: "Designed for schools and colleges",
      features: [
        "Up to 1,000 scripts/month",
        "Advanced Gemini 3.1 Pro Core",
        "Detailed Question-Level Feedback",
        "Priority Support",
        "Unlimited History Vault",
        "Batch Processing"
      ],
      buttonText: "Go Pro",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For massive use and universities",
      features: [
        "Unlimited scripts",
        "Custom AI Model Training",
        "White-label Reports",
        "Dedicated Account Manager",
        "On-premise Deployment Options",
        "SLA Guarantee"
      ],
      buttonText: "Contact Us",
      highlight: false,
      contact: true
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="glass rounded-3xl border border-border/50 shadow-2xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:rotate-12 transition-transform duration-500">
              <Sparkles size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">NextGenEval</span>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">AI Core v2.5</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-2xl hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="hidden sm:inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-xs font-bold transition-all duration-300 active:scale-95 bg-muted hover:bg-muted/80 text-foreground">
              Book a Demo
            </button>
            <button 
              onClick={onGetStarted}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-2.5 text-xs font-bold transition-all duration-300 active:scale-95 bg-foreground text-background hover:opacity-90 shadow-lg shadow-foreground/10"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-600 text-[10px] font-black uppercase tracking-widest mb-8 border border-brand-500/20 animate-fade-in">
              <Sparkles size={12} />
              The Future of Academic Auditing
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9] animate-fade-in">
              Grade with <br />
              <span className="text-brand-500">Superhuman</span> Accuracy.
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
              NextGenEval uses state-of-the-art AI to evaluate student scripts, provide detailed feedback, and generate institutional reports in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold transition-all duration-300 active:scale-95 bg-brand-500 text-white hover:bg-brand-600 shadow-xl shadow-brand-500/20"
              >
                Get Started for Free
                <ArrowRight size={20} className="ml-2" />
              </button>
              <button className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold transition-all duration-300 active:scale-95 bg-muted hover:bg-muted/80 text-foreground gap-2">
                <PlayCircle size={20} />
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-brand-500/10 rounded-3xl blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Scripts Evaluated", value: "1M+" },
              { label: "Accuracy Rate", value: "99.8%" },
              { label: "Institutions", value: "500+" },
              { label: "Time Saved", value: "85%" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-brand-500 mb-2">{stat.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl font-black tracking-tight mb-6">Built for Modern Institutions</h2>
            <p className="text-muted-foreground font-medium">Our platform combines pedagogical expertise with cutting-edge artificial intelligence to deliver unmatched grading quality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Zap,
                title: "Instant Processing",
                desc: "Process entire batches of student scripts in under 30 seconds. No more waiting weeks for results."
              },
              {
                icon: ShieldCheck,
                title: "Institutional Security",
                desc: "Enterprise-grade encryption and data privacy protocols. Your student data remains confidential and secure."
              },
              {
                icon: MessageSquare,
                title: "Granular Feedback",
                desc: "AI doesn't just grade; it explains. Students receive detailed feedback on every single question."
              },
              {
                icon: BarChart3,
                title: "Deep Analytics",
                desc: "Identify learning gaps across classes with automated performance trends and subject-wise analysis."
              },
              {
                icon: Globe,
                title: "Multi-Language",
                desc: "Support for over 50 languages, including regional dialects and complex technical terminology."
              },
              {
                icon: FileText,
                title: "Export Ready",
                desc: "Generate professional PDF reports with institutional branding, ready for distribution."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card text-card-foreground rounded-3xl border border-border/50 p-10 hover:border-brand-500/30 transition-all duration-500 group">
                <div className="w-14 h-14 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl font-black tracking-tight mb-6">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground font-medium">Choose the plan that fits your institution's scale. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`relative bg-card text-card-foreground rounded-[2.5rem] border p-10 flex flex-col ${plan.highlight ? 'border-brand-500 shadow-2xl shadow-brand-500/10 scale-105 z-10' : 'border-border/50'}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground font-bold text-sm">/month</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 font-medium">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 size={18} className="text-brand-500 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={plan.contact ? () => window.location.href = 'mailto:contact@nextgeneval.com' : onGetStarted}
                  className={`w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 ${plan.highlight ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20' : 'bg-muted hover:bg-muted/80 text-foreground'}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-6 p-6 bg-card rounded-3xl border border-border/50">
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Massive Use?</span>
                <span className="text-sm font-bold">Contact our enterprise team for volume discounts.</span>
              </div>
              <button 
                onClick={() => window.location.href = 'mailto:enterprise@nextgeneval.com'}
                className="px-6 py-3 bg-foreground text-background rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-foreground text-background rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-24 text-white/5 pointer-events-none">
              <Sparkles size={300} />
            </div>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-8 relative z-10">Ready to transform your <br />grading workflow?</h2>
            <p className="text-xl opacity-70 mb-12 max-w-2xl mx-auto font-medium relative z-10">Join hundreds of institutions already using NextGenEval to deliver better feedback to their students.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-10 py-5 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-all shadow-2xl shadow-brand-500/20 active:scale-95"
              >
                Get Started Now
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / About Section */}
      <footer id="about" className="py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">N</div>
                <span className="font-bold tracking-tight text-xl">NextGenEval</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Empowering institutions with high-precision AI evaluation and granular academic auditing.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li><a href="#features" className="hover:text-brand-500 cursor-pointer transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-brand-500 cursor-pointer transition-colors">Pricing</a></li>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Security</li>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li><a href="#about" className="hover:text-brand-500 cursor-pointer transition-colors">About Us</a></li>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-brand-500 cursor-pointer transition-colors">
                  <Mail size={16} />
                  support@nextgeneval.com
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-brand-500 cursor-pointer transition-colors">
                  <Phone size={16} />
                  +91 93814 81266
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">© 2026 NextGenEval. All rights reserved.</p>
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              <span className="hover:text-brand-500 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-brand-500 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-brand-500 cursor-pointer transition-colors">Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
