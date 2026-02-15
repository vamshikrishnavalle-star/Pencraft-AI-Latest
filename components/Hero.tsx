import React from 'react';
import { 
  Sparkles, Brain, Mic, Layers, Zap,
  Linkedin, Twitter, Instagram, Facebook, FileText, 
  MessageCircle, Mail, MessageSquare, HelpCircle, Youtube, Mic as MicIcon, Globe, Presentation
} from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onNewsletter: () => void;
  onPresentation: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onNewsletter, onPresentation }) => {
  const scrollToStart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onStart();
  };

  const handleNewsletter = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNewsletter();
  };
  
  const handlePresentation = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onPresentation();
  };

  return (
    <div className="flex flex-col w-full overflow-hidden bg-cream">
      {/* 1. HERO SECTION */}
      <section className="px-3 pt-4 pb-12 md:px-4 md:pt-10 md:pb-24">
        {/* Updated Gradient and Padding for Italic Text Clipping */}
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-[#121212] via-[#171717] to-[#0d1b2a] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative min-h-[600px] md:min-h-[700px] flex items-center justify-center shadow-2xl shadow-gray-400/20 ring-1 ring-white/10">
            {/* Background Effects - Enhanced Blue Shade */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60 mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none opacity-50 mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.07] pointer-events-none"></div>

            <div className="relative z-10 p-6 md:p-16 lg:p-20 flex flex-col items-center text-center max-w-5xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-gray-300 text-sm font-medium tracking-wide mb-8 animate-fade-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-gray-500 border border-gray-900"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-400 border border-gray-900"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-900"></div>
                  </div>
                  <span className="ml-1">BETA ACCESS NOW LIVE</span>
                </div>

                {/* Headline - Added padding-right (pr-4 md:pr-6) to prevent italic 'r' from being clipped */}
                <h1 className="flex flex-col items-center justify-center font-serif text-white animate-slide-up opacity-0 mb-10 w-full" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-400 italic font-medium text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] leading-[0.9] tracking-tighter mb-4 filter drop-shadow-2xl pr-4 md:pr-6">
                    PenCraft AI
                  </span>
                  <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-400 tracking-wide">
                    Your Content Operating System
                  </span>
                </h1>

                {/* Subhead */}
                <p className="text-lg md:text-2xl lg:text-3xl text-gray-400 max-w-3xl leading-relaxed font-light animate-slide-up opacity-0 mt-2 md:mt-4" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                  An AI That Thinks Like You, Speaks Like You.
                  <br className="hidden md:block" />
                  <span className="text-gray-200 font-medium block md:inline mt-2 md:mt-0">Your Perspective, Amplified.</span>
                </p>

                {/* CTA Buttons */}
                <div className="mt-12 opacity-0 animate-fade-in flex flex-col md:flex-row items-center justify-center gap-4 w-full md:w-auto" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  <button 
                    onClick={scrollToStart}
                    className="bg-white text-primary px-8 py-4 md:px-10 md:py-5 rounded-full font-bold hover:bg-gray-100 transition-all duration-500 ease-out-expo hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl hover:shadow-white/10 text-base md:text-lg w-full md:w-auto"
                  >
                    Start Creating
                  </button>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button 
                        onClick={handleNewsletter}
                        className="bg-white/10 text-white border border-white/20 px-6 py-4 md:px-8 md:py-5 rounded-full font-bold hover:bg-white/20 transition-all duration-500 ease-out-expo hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md text-base md:text-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <Mail size={20} />
                        Newsletter Agent
                    </button>
                    <button 
                        onClick={handlePresentation}
                        className="bg-white/10 text-white border border-white/20 px-6 py-4 md:px-8 md:py-5 rounded-full font-bold hover:bg-white/20 transition-all duration-500 ease-out-expo hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md text-base md:text-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <Presentation size={20} />
                        Presentation Studio
                    </button>
                  </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. ABOUT / WHAT IT IS */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 text-center reveal">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-8 text-primary">What It Is</h2>
          <div className="prose prose-lg mx-auto text-secondary leading-loose">
            <p className="text-lg md:text-2xl font-light mb-8">
              PenCraft AI is an intelligent virtual assistant that acts as an extension of your mind. It understands how you think, what you believe, and how you naturally express ideas—then communicates that perspective seamlessly across platforms.
            </p>
            <p className="text-base md:text-lg font-medium text-primary">
              This isn’t generic AI-generated content.<br />
              It’s your voice, represented with precision.
            </p>
          </div>
        </div>
      </section>

      {/* 3. BUILT AROUND YOUR THOUGHT PROCESS */}
      <section className="py-16 md:py-24 bg-cream relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-primary">Built Around Your Thought Process</h2>
            <p className="text-secondary">Instead of responding mechanically, the agent:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "Interprets Ideas", desc: "The way you would naturally process them." },
              { icon: Layers, title: "Frames Opinions", desc: "Using your specific reasoning style." },
              { icon: Mic, title: "Reflects Tone", desc: "Capturing your intent and personality." },
              { icon: Zap, title: "Maintains Consistency", desc: "In how you show up online." },
            ].map((feature, i) => (
              <div key={i} className={`p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-[2px] hover:border-gray-200 group reveal delay-${(i+1) * 100}`}>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-105 transition-transform duration-500">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 font-medium text-lg text-primary reveal delay-300">
            It’s not just posting content—it’s representing you.
          </div>
        </div>
      </section>

      {/* 4. PLATFORM AWARE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-primary">Platform-Aware. Voice-Consistent.</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              PenCraft AI adapts format, length, and structure for each platform—while preserving your core identity and perspective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Linkedin, name: "LinkedIn", color: "text-blue-700", desc: "Professional, insightful, credibility-focused." },
              { icon: Twitter, name: "X (Twitter)", color: "text-black", desc: "Short-form opinions, threads, sharp commentary." },
              { icon: Instagram, name: "Instagram", color: "text-pink-600", desc: "Conversational, relatable, expressive visuals." },
              { icon: Facebook, name: "Facebook", color: "text-blue-600", desc: "Personal, engaging, community-driven." },
              { icon: MessageCircle, name: "Threads", color: "text-black", desc: "Quick, casual updates and opinions." },
              { icon: FileText, name: "Medium", color: "text-gray-800", desc: "Article-focused, structured, deeper perspectives." },
              { icon: Mail, name: "Substack", color: "text-orange-500", desc: "Newsletter-style; direct audience engagement." },
              { icon: MessageSquare, name: "Reddit", color: "text-orange-600", desc: "Informative, value-driven, community specific." },
              { icon: HelpCircle, name: "Quora", color: "text-red-700", desc: "Authoritative answers demonstrating expertise." },
              { icon: Youtube, name: "YouTube", color: "text-red-600", desc: "Community posts & video scripts." },
              { icon: MicIcon, name: "Podcasts", color: "text-purple-600", desc: "Scripts & show notes." },
              { icon: Globe, name: "Blogs", color: "text-emerald-600", desc: "SEO-friendly, structured content." },
            ].map((p, i) => (
              <div key={i} className={`flex gap-4 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100 reveal delay-${(i % 4) * 100} hover:scale-[1.01]`}>
                <div className={`shrink-0 mt-1`}>
                  <p.icon size={24} className={p.color} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                  <p className="text-base text-secondary leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SPEAK ONCE */}
      <section className="py-16 md:py-24 bg-primary text-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 reveal">
          <h2 className="text-3xl md:text-5xl font-serif font-medium mb-8">Speak Once. Show Up Everywhere.</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
            Share a thought, a rough idea, or even a single sentence.<br/><br/>
            PenCraft AI transforms it into platform-specific content, so it feels like you’re everywhere at once, saying the right thing, in the right way.
          </p>
          <button 
            onClick={scrollToStart}
            className="bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
          >
            Start Creating
          </button>
        </div>
      </section>

      {/* 6. IN ESSENCE */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-3xl mx-auto px-4 text-center reveal">
          <div className="mb-8">
            <span className="text-indigo-600 font-serif italic text-2xl">In Essence</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium mb-8 text-primary leading-tight">
            It doesn’t post for you.<br/>
            It thinks for you—then writes.
          </h2>
          <p className="text-lg text-secondary">
            A true personal AI PenCraft agent that carries your voice, your opinions, and your presence across the digital world.
          </p>
        </div>
      </section>
    </div>
  );
};