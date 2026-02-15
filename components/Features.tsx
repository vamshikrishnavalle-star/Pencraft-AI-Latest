import React from 'react';
import { 
  Cpu, Layout, Search, Image as ImageIcon, CheckSquare, BarChart3, ArrowRight 
} from 'lucide-react';

interface FeaturesProps {
  onStart: () => void;
}

export const Features: React.FC<FeaturesProps> = ({ onStart }) => {
  const features = [
    {
      icon: Cpu,
      title: "AI-Powered Content Generation",
      items: [
        "Turn a single idea into polished posts tailored for multiple social media platforms.",
        "Adaptive writing styles: professional, conversational, authority-focused, or custom."
      ]
    },
    {
      icon: Layout,
      title: "Platform-Specific Customization",
      items: [
        "Optimized for LinkedIn, X, Instagram, Facebook, Threads, Medium, Substack, Reddit, Quora, YouTube, Podcasts, and Blogs.",
        "Automatic adjustment of tone, format, and visuals."
      ]
    },
    {
      icon: Search,
      title: "Smart Research Assistant",
      items: [
        "AI gathers insights from uploaded files, URLs, or web searches.",
        "Generates concise summaries, trend insights, and actionable takeaways."
      ]
    },
    {
      icon: ImageIcon,
      title: "Image Generation & Visual Branding",
      items: [
        "Create custom, high-quality visuals using AI.",
        "Platform-specific aspect ratios, color schemes, and brand consistency."
      ]
    },
    {
      icon: CheckSquare,
      title: "Approval & Iteration Workflow",
      items: [
        "Live preview, side-by-side comparison, and A/B testing for multiple content versions.",
        "Edit, regenerate, and approve posts in a single intuitive interface."
      ]
    },
    {
      icon: BarChart3,
      title: "Analytics & Performance Tracking",
      items: [
        "Measure engagement with views, likes, comments, and shares.",
        "Refine content strategy based on real-time insights."
      ]
    }
  ];

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto reveal">
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 text-primary">
            Powerful Tools to Amplify Your Voice
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform your thoughts into platform-ready content across LinkedIn, X, Instagram, and more—effortlessly.
          </p>
          <button 
            onClick={onStart}
            className="bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className={`p-8 rounded-3xl bg-cream border border-gray-100 hover:shadow-xl transition-all duration-500 ease-out group reveal delay-${(idx % 3) * 100} hover:-translate-y-[2px]`}>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-105 transition-transform duration-500">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4 text-primary">{feature.title}</h3>
                <ul className="space-y-3">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-secondary leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 opacity-50"></div>
        <div className="relative z-10 max-w-3xl mx-auto reveal">
          <h2 className="text-4xl md:text-5xl font-serif mb-8">See Your Voice Everywhere</h2>
          <button 
            onClick={onStart}
            className="bg-white text-primary px-10 py-4 rounded-full text-lg font-bold hover:bg-indigo-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 mx-auto shadow-lg"
          >
            Start Writing Now <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};