import React from 'react';
import { Heart, Globe, Lightbulb, Users } from 'lucide-react';

interface AboutProps {
  onStart: () => void;
}

export const About: React.FC<AboutProps> = ({ onStart }) => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-20 px-4 text-center bg-cream">
        <div className="max-w-4xl mx-auto reveal">
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 text-primary">
            We Build AI That Thinks Like You
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            PenCraft AI is designed to amplify your voice, not replace it.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center reveal">
          <h2 className="text-3xl font-serif font-medium mb-8 text-indigo-900">Our Story</h2>
          <p className="text-lg text-secondary leading-loose">
            PenCraft AI was founded to help creators, professionals, and thought leaders express their ideas effortlessly. Our mission is to ensure that your perspective is accurately represented across all digital platforms. We believe that technology should serve creativity, enabling you to focus on the core of your message while we handle the nuances of delivery.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-medium mb-12 text-center reveal">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Voice First", desc: "Every piece of content is your voice, not generic AI." },
              { icon: Globe, title: "Platform Precision", desc: "AI adapts content for each social network’s style and tone." },
              { icon: Lightbulb, title: "Innovation", desc: "Cutting-edge AI research, content generation, and visual design." },
              { icon: Users, title: "User Empowerment", desc: "Tools designed to save time while maintaining full control." }
            ].map((val, i) => (
              <div key={i} className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 ease-out reveal delay-${(i % 4) * 100} hover:-translate-y-[2px]`}>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                  <val.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                <p className="text-secondary">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Note */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto reveal">
          <p className="text-lg text-secondary italic">
            “Our team is a mix of AI engineers, designers, and social media experts dedicated to making your digital presence seamless and authentic.”
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-primary text-white text-center reveal">
        <h2 className="text-4xl font-serif mb-8">Ready to Amplify Your Voice?</h2>
        <button 
          onClick={onStart}
          className="bg-white text-primary px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          Get Started
        </button>
      </section>
    </div>
  );
};