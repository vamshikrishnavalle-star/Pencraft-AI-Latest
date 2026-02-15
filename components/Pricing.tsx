import React from 'react';
import { 
  Sliders, Layers, PenTool, Image as ImageIcon, Search, Users, 
  CheckCircle2, ArrowRight, Zap, Target, Briefcase 
} from 'lucide-react';

interface PricingProps {
  onStart: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onStart }) => {
  const impactFactors = [
    {
      icon: Layers,
      title: "Content Volume",
      desc: "Number of posts, threads, articles, or newsletters generated per month"
    },
    {
      icon: Sliders,
      title: "Platform Coverage",
      desc: "LinkedIn, X, Instagram, Facebook, Threads, Medium, Substack, Reddit, Quora"
    },
    {
      icon: PenTool,
      title: "Writing Depth & Style",
      desc: "Standard professional tone, Authority positioning, Highly personalized voice modeling"
    },
    {
      icon: ImageIcon,
      title: "Image Generation",
      desc: "Platform-specific visuals, Brand colors, typography, Multiple aspect ratios"
    },
    {
      icon: Search,
      title: "Research & Context",
      desc: "File uploads (PDFs, documents), URL research, Industry-specific insights"
    },
    {
      icon: Users,
      title: "Team Access",
      desc: "Multiple users, Approval workflows, Shared brand voice presets"
    }
  ];

  const personas = [
    {
      icon: Zap,
      title: "Solo Creators & Professionals",
      desc: "Build a strong online presence without spending hours writing."
    },
    {
      icon: Target,
      title: "Founders & Thought Leaders",
      desc: "Consistently publish high-quality opinions across platforms."
    },
    {
      icon: Briefcase,
      title: "Agencies & Teams",
      desc: "Manage multiple voices, clients, and workflows efficiently."
    }
  ];

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto reveal">
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 text-primary">
            Pricing That Adapts to You
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            No fixed plans. No unnecessary limits.<br/>
            PenCraft AI is priced based on how you use it.
          </p>
          <button 
            onClick={onStart}
            className="bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
          >
            Get Your Custom Plan
          </button>
        </div>
      </section>

      {/* Why Custom Pricing */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl font-serif font-medium mb-6 text-primary">Why Custom Pricing?</h2>
            <p className="text-lg text-secondary max-w-3xl mx-auto leading-relaxed">
              Every creator uses content differently. Some publish daily across platforms, others focus on deep long-form authority. Instead of forcing rigid tiers, PenCraft AI adapts pricing based on your specific needs.
            </p>
            <p className="mt-4 font-semibold text-indigo-600">You only pay for what actually adds value to your workflow.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impactFactors.map((factor, idx) => (
              <div key={idx} className={`p-6 rounded-2xl bg-cream border border-gray-100 hover:shadow-lg transition-all duration-500 ease-out reveal delay-${(idx % 3) * 100} hover:-translate-y-[2px]`}>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                  <factor.icon size={20} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-primary">{factor.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{factor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is It For */}
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-medium mb-12 text-center text-primary reveal">Who Is It For?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {personas.map((p, idx) => (
              <div key={idx} className={`bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-[2px] transition-all duration-500 reveal delay-${(idx % 3) * 100}`}>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                  <p.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                <p className="text-secondary">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center reveal">
          <h2 className="text-3xl font-serif font-medium mb-12 text-primary">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>

            {[
              "Tell us how you plan to use PenCraft AI",
              "We generate a custom setup based on your needs",
              "You get a tailored pricing plan that scales with you"
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center bg-white p-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg">
                  {i + 1}
                </div>
                <p className="font-medium text-lg max-w-[200px]">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-secondary">No hidden fees. No locked features. Full transparency.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center rounded-t-[3rem] mx-2 md:mx-4 reveal">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif mb-8">Build Your Custom PenCraft Setup</h2>
          <button 
            onClick={onStart}
            className="bg-white text-primary px-10 py-5 rounded-full text-xl font-bold hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2 mx-auto shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started <ArrowRight size={24} />
          </button>
          <p className="mt-6 text-gray-400">Have specific requirements? Contact us for a tailored solution.</p>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-4 bg-cream text-center">
        <div className="max-w-4xl mx-auto border-t border-gray-200 pt-8 reveal">
          <h4 className="font-bold text-sm uppercase tracking-widest text-secondary mb-6">All custom plans include</h4>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            {["Platform-aware content generation", "Personalized writing style", "Voice consistency across platforms", "Secure data handling", "Ongoing improvements and updates"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};