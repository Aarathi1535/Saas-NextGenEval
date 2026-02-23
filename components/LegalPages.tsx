import React from 'react';
import { ArrowLeft, Shield, FileText, Cookie, Sparkles } from 'lucide-react';

export type LegalPageType = 'privacy' | 'terms' | 'cookie';

interface LegalPagesProps {
  type: LegalPageType;
  onBack: () => void;
}

const LegalPages: React.FC<LegalPagesProps> = ({ type, onBack }) => {
  const content = {
    privacy: {
      title: "Privacy Policy",
      icon: <Shield className="text-brand-500" size={32} />,
      lastUpdated: "February 23, 2026",
      sections: [
        {
          heading: "1. Information Collection",
          text: "We collect information that you provide directly to us when you create an account, upload student scripts for evaluation, or communicate with us. This includes institutional names, administrator emails, and the content of uploaded academic documents."
        },
        {
          heading: "2. Use of Information",
          text: "The primary use of your information is to provide AI-driven academic evaluation services. We use the uploaded scripts to generate grading reports and feedback. We do not use student data for training our base models without explicit institutional consent."
        },
        {
          heading: "3. Data Security",
          text: "We implement robust security measures designed to protect your data from unauthorized access, disclosure, or destruction. All document processing is performed over encrypted channels."
        },
        {
          heading: "4. Data Retention",
          text: "Institutional records and evaluation history are stored in our secure vault. Administrators have full control over their data and can delete records at any time from their dashboard."
        }
      ]
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText className="text-brand-500" size={32} />,
      lastUpdated: "February 23, 2026",
      sections: [
        {
          heading: "1. Acceptance of Terms",
          text: "By accessing or using NextGenEval, you agree to be bound by these Terms of Service and all applicable laws and regulations."
        },
        {
          heading: "2. Use License",
          text: "Permission is granted to institutions to use our AI evaluation tools for academic purposes. This is a grant of a license, not a transfer of title, and under this license, you may not use the materials for any commercial purpose without authorization."
        },
        {
          heading: "3. Credit System",
          text: "Evaluations are processed using a credit-based system. Credits are non-transferable and must be used within the terms of the specific institutional plan selected."
        },
        {
          heading: "4. Accuracy of AI",
          text: "While NextGenEval strives for superhuman accuracy, AI evaluations should be reviewed by qualified academic professionals. The institution remains responsible for final grading decisions."
        }
      ]
    },
    cookie: {
      title: "Cookie Policy",
      icon: <Cookie className="text-brand-500" size={32} />,
      lastUpdated: "February 23, 2026",
      sections: [
        {
          heading: "1. What are Cookies?",
          text: "Cookies are small text files stored on your device that help us provide a better user experience. We use them to remember your login session and theme preferences."
        },
        {
          heading: "2. Essential Cookies",
          text: "These cookies are strictly necessary for the operation of our platform, including authentication and security features."
        },
        {
          heading: "3. Performance Cookies",
          text: "We use performance cookies to understand how users interact with our platform, allowing us to optimize the evaluation workflow and dashboard speed."
        },
        {
          heading: "4. Managing Cookies",
          text: "You can control and manage cookies through your browser settings. However, disabling essential cookies may impact the functionality of the NextGenEval dashboard."
        }
      ]
    }
  };

  const activeContent = content[type];

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand-600 transition-all uppercase tracking-widest mb-12"
      >
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all">
          <ArrowLeft size={14} />
        </div>
        Back
      </button>

      <div className="bg-card text-card-foreground rounded-[2.5rem] border border-border/50 shadow-2xl p-8 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-brand-500/5">
          <Sparkles size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-brand-500/10 rounded-3xl flex items-center justify-center">
              {activeContent.icon}
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">{activeContent.title}</h1>
              <p className="text-sm font-bold text-muted-foreground mt-1">Last Updated: {activeContent.lastUpdated}</p>
            </div>
          </div>

          <div className="space-y-12 mt-16">
            {activeContent.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed font-medium">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-border/50 text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              © 2026 NextGenEval. All rights reserved.
            </p>
            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-[0.2em] mt-2">
              Developed from the mind of aarshiv.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPages;
