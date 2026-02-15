import React, { useState, useRef } from 'react';
import { 
  Presentation, MonitorPlay, Users, Sliders, ChevronRight, RefreshCw, Copy, Check, 
  Sparkles, FileText, Download, LayoutTemplate, MessageSquare, Lightbulb
} from 'lucide-react';
import { PresentationType, PresentationTone, PresentationResult } from '../types';
import * as geminiService from '../services/geminiService';

export const PresentationStudio: React.FC = () => {
  // Input State
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [audience, setAudience] = useState('');
  const [type, setType] = useState<PresentationType>(PresentationType.StartupPitch);
  const [tone, setTone] = useState<PresentationTone>(PresentationTone.Persuasive);
  const [slideCount, setSlideCount] = useState(10);

  // Process State
  const [isGenerating, setIsGenerating] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [result, setResult] = useState<PresentationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scroll ref
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setShowResult(false);
    
    const steps = [
      "Agent understanding your idea...",
      "Agent structuring the narrative...",
      "Agent organizing slides...",
      "Agent preparing presentation..."
    ];

    let stepIndex = 0;
    setProcessStep(steps[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setProcessStep(steps[stepIndex]);
      }
    }, 1500);

    try {
      const presentation = await geminiService.generatePresentation(topic, type, audience, tone, slideCount, notes);
      
      clearInterval(interval);
      setProcessStep("Finalizing deck...");
      
      if (presentation) {
        setResult(presentation);
        setTimeout(() => {
          setIsGenerating(false);
          setShowResult(true);
          setTimeout(() => {
              resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }, 800);
      } else {
         throw new Error("Failed to generate");
      }

    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      setProcessStep("Error occurred.");
    }
  };

  const handleCopy = () => {
    if (!result) return;
    
    let text = `# ${result.title}\n\n`;
    result.slides.forEach(slide => {
        text += `## Slide ${slide.slideNumber}: ${slide.title}\n`;
        slide.bullets.forEach(b => text += `- ${b}\n`);
        text += `\n*Speaker Notes:* ${slide.speakerNotes}\n`;
        text += `\n*Visual Idea:* ${slide.visualSuggestion}\n\n---\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!result) return;
    let text = `# ${result.title}\n\n`;
    result.slides.forEach(slide => {
        text += `## Slide ${slide.slideNumber}: ${slide.title}\n`;
        slide.bullets.forEach(b => text += `- ${b}\n`);
        text += `\n**Speaker Notes:** ${slide.speakerNotes}\n`;
        text += `\n**Visual Idea:** ${slide.visualSuggestion}\n\n---\n\n`;
    });

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, '-').toLowerCase()}-presentation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-cream min-h-screen font-sans text-primary">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-20 px-4 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 via-[#1a1a1a] to-primary z-0"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none opacity-40 mix-blend-screen" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-gray-300 text-xs font-medium tracking-wide mb-6">
            <Presentation size={12} className="text-blue-300" />
            <span>PRESENTATION STUDIO</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-medium mb-6 leading-tight">
            Structure Ideas Into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-100">Powerful Slides.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Communicate clarity, structure, and confidence. Your agent prepares the story and structure, so you can focus on presenting.
          </p>
          
          <div className="mt-8">
             <button 
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all active:scale-[0.98]"
             >
                Create Pitch Deck
             </button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        
        {/* 2. INPUT SECTION */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-10 transition-all duration-500">
          
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                <MonitorPlay size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-primary">What are you presenting?</h2>
                <p className="text-sm text-secondary">Share your idea. Your agent will structure the deck.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Left Column: Core Input */}
            <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Presentation Type</label>
                    <select 
                        value={type}
                        onChange={(e) => setType(e.target.value as PresentationType)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none bg-white cursor-pointer transition-all"
                    >
                        {Object.values(PresentationType).map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Core Topic / Idea <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. A new SaaS platform for remote team productivity..."
                        className="w-full h-32 p-4 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none text-base placeholder:text-gray-300 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Notes <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Specific metrics, team members to mention, or key constraints..."
                        className="w-full h-24 p-4 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none text-base placeholder:text-gray-300 outline-none"
                    />
                </div>
            </div>

            {/* Right Column: Refinements */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                    <div className="relative">
                        <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="e.g. Angel Investors, Enterprise Clients"
                            className="w-full p-3 pl-10 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tone / Persona</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(PresentationTone).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                className={`flex items-center justify-center px-2 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                    tone === t
                                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Approximate Slide Count: {slideCount}</label>
                    <input 
                        type="range" 
                        min="5" 
                        max="20" 
                        step="1"
                        value={slideCount}
                        onChange={(e) => setSlideCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>5 slides</span>
                        <span>20 slides</span>
                    </div>
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
                        <RefreshCw size={20} className="animate-spin" />
                        <span>Working...</span>
                    </>
                ) : (
                    <>
                        <LayoutTemplate size={20} />
                        <span>Generate Deck Structure</span>
                    </>
                )}
             </button>
          </div>
        </div>

        {/* 3. AGENT PROCESSING PHASE */}
        {isGenerating && (
            <div className="mt-12 py-12 flex flex-col items-center justify-center animate-fade-in text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-20 animate-pulse"></div>
                    <MonitorPlay size={32} className="text-blue-600 relative z-10" />
                </div>
                <h3 className="text-2xl font-serif font-medium text-primary mb-2 animate-pulse">{processStep}</h3>
                <p className="text-secondary max-w-md mx-auto">
                    Delegating structure to your agent. Not just slides, but thinking.
                </p>
            </div>
        )}

        {/* 4. OUTPUT SECTION */}
        {showResult && result && (
            <div ref={resultRef} className="mt-12 animate-slide-up pb-20">
                
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-primary mb-2">{result.title}</h2>
                        <p className="text-secondary">Prepared by the agent. Final delivery is yours.</p>
                    </div>
                    <div className="flex gap-3">
                         <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors text-primary active:scale-[0.98] shadow-sm"
                        >
                            <Download size={16} />
                            Export Outline
                        </button>
                         <button 
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-5 py-3 bg-primary text-white border border-primary rounded-full text-sm font-medium hover:bg-gray-800 transition-colors active:scale-[0.98] shadow-lg"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? "Copied to Clipboard" : "Copy All Slides"}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {result.slides.map((slide) => (
                        <div key={slide.slideNumber} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                                <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest">Slide {slide.slideNumber}</span>
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                </div>
                            </div>
                            
                            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Slide Content */}
                                <div className="lg:col-span-2">
                                    <h3 className="text-2xl font-bold text-primary mb-6">{slide.title}</h3>
                                    <ul className="space-y-4">
                                        {slide.bullets.map((bullet, i) => (
                                            <li key={i} className="flex gap-3 text-lg text-gray-700 leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Sidebar: Notes & Visuals */}
                                <div className="lg:col-span-1 bg-gray-50/50 rounded-xl p-6 border border-gray-100 h-full">
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                            <MessageSquare size={14} /> Speaker Notes
                                        </h4>
                                        <p className="text-sm text-gray-600 italic leading-relaxed">
                                            "{slide.speakerNotes}"
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                            <Lightbulb size={14} /> Visual Suggestion
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {slide.visualSuggestion}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm mb-4">Need to make changes?</p>
                     <button 
                        onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                        className="text-primary font-medium hover:underline"
                     >
                        Adjust inputs and regenerate
                     </button>
                </div>

            </div>
        )}
      </div>
    </div>
  );
};