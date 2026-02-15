import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, Users, Sliders, ChevronRight, RefreshCw, Copy, Check, 
  BookOpen, Sparkles, Send, FileText, ArrowLeft, Loader2 
} from 'lucide-react';
import { WritingStyle, NewsletterDepth } from '../types';
import * as geminiService from '../services/geminiService';

export const NewsletterGenerator: React.FC = () => {
  // Input State
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState<WritingStyle>(WritingStyle.Professional);
  const [depth, setDepth] = useState<NewsletterDepth>(NewsletterDepth.Balanced);

  // Process State
  const [isGenerating, setIsGenerating] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scroll ref
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setShowResult(false);
    
    // Simulate thinking process for UX
    const steps = [
      "Analyzing your topic...",
      "Expanding key insights...",
      "Structuring the narrative...",
      "Drafting final content..."
    ];

    let stepIndex = 0;
    setProcessStep(steps[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setProcessStep(steps[stepIndex]);
      }
    }, 1500); // Change step every 1.5s roughly aligning with API call time

    try {
      const text = await geminiService.generateNewsletter(topic, notes, audience, tone, depth);
      setResult(text);
      
      clearInterval(interval);
      setProcessStep("Finalizing...");
      
      setTimeout(() => {
        setIsGenerating(false);
        setShowResult(true);
        // Scroll to result
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }, 800);

    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      setProcessStep("Error occurred.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-cream min-h-screen font-sans text-primary">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-20 px-4 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 via-[#1a1a1a] to-primary z-0"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none opacity-40 mix-blend-screen" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-gray-300 text-xs font-medium tracking-wide mb-6">
            <Sparkles size={12} className="text-indigo-300" />
            <span>AI NEWSLETTER AGENT</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-medium mb-6 leading-tight">
            Turn Ideas Into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-100">Deep Insights.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Don't just write. Your agent analyzes your topic, expands on your notes, and structures a professional newsletter ready for your audience.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        
        {/* 2. INPUT SECTION */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-10 transition-all duration-500">
          
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
                <PenTool size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-primary">Share your idea</h2>
                <p className="text-sm text-secondary">Your agent will handle the research, structure, and writing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Left Column: Core Input */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What is your newsletter about? <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. The future of remote work and how AI agents are changing team dynamics..."
                        className="w-full h-32 p-4 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all resize-none text-base placeholder:text-gray-300 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Context or Rough Notes <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Paste links, bullet points, or rough thoughts here. The agent will weave them in."
                        className="w-full h-32 p-4 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all resize-none text-base placeholder:text-gray-300 outline-none"
                    />
                </div>
            </div>

            {/* Right Column: Refinements */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Who is this for?</label>
                    <div className="relative">
                        <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="e.g. Founders, Marketing Managers, Tech Enthusiasts"
                            className="w-full p-3 pl-10 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Depth</label>
                    <div className="grid grid-cols-1 gap-2">
                        {Object.values(NewsletterDepth).map((d) => (
                            <button
                                key={d}
                                onClick={() => setDepth(d)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                    depth === d 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-600'
                                }`}
                            >
                                <span>{d}</span>
                                {depth === d && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Writing Tone</label>
                    <select 
                        value={tone}
                        onChange={(e) => setTone(e.target.value as WritingStyle)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none bg-white cursor-pointer"
                    >
                        {Object.values(WritingStyle).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
             <button
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className={`
                    relative overflow-hidden group bg-primary text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98]
                    ${(!topic.trim() || isGenerating) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'}
                `}
             >
                {isGenerating ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Working on it...</span>
                    </>
                ) : (
                    <>
                        <Sparkles size={20} />
                        <span>Generate Newsletter</span>
                    </>
                )}
             </button>
          </div>
        </div>

        {/* 3. AGENT UNDERSTANDING PHASE (Visualized Processing) */}
        {isGenerating && (
            <div className="mt-12 py-12 flex flex-col items-center justify-center animate-fade-in text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 animate-pulse"></div>
                    <BookOpen size={32} className="text-indigo-600 relative z-10" />
                </div>
                <h3 className="text-2xl font-serif font-medium text-primary mb-2 animate-pulse">{processStep}</h3>
                <p className="text-secondary max-w-md mx-auto">
                    The agent is connecting your ideas with broader context to build a structured draft.
                </p>
            </div>
        )}

        {/* 4. OUTPUT SECTION */}
        {showResult && (
            <div ref={resultRef} className="mt-12 animate-slide-up">
                
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                           <FileText size={16} />
                           <span>Generated Draft</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span className="text-indigo-600">{depth}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors text-primary active:scale-[0.98]"
                            >
                                {copied ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
                                {copied ? "Copied" : "Copy Content"}
                            </button>
                            <button 
                                onClick={handleGenerate}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors text-primary active:scale-[0.98]"
                            >
                                <RefreshCw size={16} />
                                Regenerate
                            </button>
                        </div>
                    </div>

                    {/* Editor View */}
                    <div className="p-8 md:p-12 min-h-[500px] bg-white">
                        <div className="max-w-3xl mx-auto prose prose-indigo prose-lg leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
                            {result}
                        </div>
                    </div>
                </div>

                {/* 5. USAGE GUIDANCE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-20">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                            <Send size={20} />
                        </div>
                        <h4 className="font-bold text-primary mb-2">Send to Subscribers</h4>
                        <p className="text-sm text-secondary">Copy the structured draft directly into Substack, Beehiiv, or your email marketing tool.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                            <Sliders size={20} />
                        </div>
                        <h4 className="font-bold text-primary mb-2">Refine & Edit</h4>
                        <p className="text-sm text-secondary">The agent provides a strong foundation. Add your final personal touch before publishing.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                            <RefreshCw size={20} />
                        </div>
                        <h4 className="font-bold text-primary mb-2">Repurpose</h4>
                        <p className="text-sm text-secondary">Use the "Deep Dive" sections as standalone blog posts or LinkedIn articles.</p>
                    </div>
                </div>

            </div>
        )}
      </div>
    </div>
  );
};