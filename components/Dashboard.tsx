import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, CheckCircle2, ChevronRight, Wand2, RefreshCw, Copy, 
  ArrowLeft, ArrowRight, Type, Share2, Image as ImageIcon,
  Terminal, Sparkles, BookOpen, PenTool, Send, 
  AlertTriangle, PlayCircle, Lock, ShieldCheck, X, FileWarning, Info, Download, Globe,
  Paperclip, Link as LinkIcon, FileText, Plus, Trash2
} from 'lucide-react';
import JSZip from 'jszip';
import { Platform, WritingStyle, ProjectState, GeneratedContent, Reference } from '../types';
import { PLATFORM_CONFIG, STYLE_CONFIG } from '../constants';
import * as geminiService from '../services/geminiService';
import { automationService } from '../services/automationService';

const steps = [
  { id: 1, name: 'Topic', icon: Type },
  { id: 2, name: 'Language', icon: Globe },
  { id: 3, name: 'Platforms', icon: Share2 },
  { id: 4, name: 'Processing', icon: Wand2 },
  { id: 5, name: 'Review', icon: CheckCircle2 },
  { id: 6, name: 'Execute', icon: Send },
];

const LANGUAGES = [
  "English", "Spanish", "Mandarin Chinese", "Hindi", "Arabic", 
  "Portuguese", "French", "German", "Japanese", "Korean"
];

export const Dashboard: React.FC = () => {
  // --- STATE INITIALIZATION WITH LOCAL STORAGE RESTORE ---
  
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem('PENCRAFT_CURRENT_STEP');
      const step = savedStep ? parseInt(savedStep, 10) : 1;
      // If stuck in processing step (4) on reload, move to Review (5) to avoid stuck state
      return step === 4 ? 5 : step;
    } catch {
      return 1;
    }
  });

  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [showResearch, setShowResearch] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Instruction Modal State
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Temp state for adding references
  const [tempUrl, setTempUrl] = useState('');
  const [tempNote, setTempNote] = useState('');
  const [isAddingRef, setIsAddingRef] = useState<'url' | 'text' | null>(null);

  // Track status per platform
  const [executionStatus, setExecutionStatus] = useState<Record<string, {
    status: 'idle' | 'running' | 'success' | 'manual_fallback' | 'error',
    log: string
  }>>({});

  // Use logsContainerRef for internal scrolling to prevent page jumps
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ProjectState>(() => {
    const defaultState = {
      topic: '',
      platforms: [],
      style: WritingStyle.Professional,
      researchData: '',
      results: {} as Record<Platform, GeneratedContent>,
      isResearching: false,
      isGenerating: false,
      language: 'English',
      references: [],
    };

    try {
      const savedState = localStorage.getItem('PENCRAFT_PROJECT_STATE');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Ensure we reset transient loading states when restoring
        return {
          ...parsed,
          isResearching: false,
          isGenerating: false,
          results: Object.entries(parsed.results || {}).reduce((acc, [k, v]: [string, any]) => {
            acc[k as Platform] = { 
                ...v, 
                loading: false, 
                textLoading: false, 
                imageLoading: false 
            };
            return acc;
          }, {} as Record<Platform, GeneratedContent>)
        };
      }
    } catch (e) {
      console.warn("Failed to load saved state:", e);
    }
    return defaultState;
  });

  // --- AUTO-SAVE EFFECT ---
  useEffect(() => {
    try {
      // Create a clean copy of state without loading indicators for storage
      const stateToSave = {
        ...state,
        isResearching: false,
        isGenerating: false,
        results: Object.keys(state.results).reduce((acc, key) => {
          const k = key as Platform;
          const result = state.results[k];
          acc[k] = { ...result, loading: false, textLoading: false, imageLoading: false };
          return acc;
        }, {} as Record<Platform, GeneratedContent>)
      };

      localStorage.setItem('PENCRAFT_PROJECT_STATE', JSON.stringify(stateToSave));
      localStorage.setItem('PENCRAFT_CURRENT_STEP', currentStep.toString());
    } catch (e) {
      console.warn('Failed to save state to localStorage (likely quota exceeded):', e);
    }
  }, [state, currentStep]);

  // Auto-scroll logs internally without moving window
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [processingLogs, currentStep]);

  // Scroll to top when changing steps
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good evening.';
    if (hour < 12) return 'Good morning.';
    if (hour < 18) return 'Good afternoon.';
    return 'Good evening.';
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, topic: e.target.value }));
  };

  const togglePlatform = (p: Platform) => {
    setState(prev => {
      const exists = prev.platforms.includes(p);
      return {
        ...prev,
        platforms: exists 
          ? prev.platforms.filter(plat => plat !== p)
          : [...prev.platforms, p]
      };
    });
  };

  const addLog = (msg: string) => {
    setProcessingLogs(prev => [...prev, msg]);
  };

  // --- Reference Handling ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newRefs: Reference[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        const promise = new Promise<void>((resolve) => {
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                let data = result;
                // For base64 files (PDF), strip the prefix
                if (result.includes('base64,')) {
                    data = result.split(',')[1];
                }
                
                newRefs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'file',
                    name: file.name,
                    mimeType: file.type,
                    data: data
                });
                resolve();
            };
        });

        if (file.type.includes('pdf')) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
        await promise;
    }

    setState(prev => ({
        ...prev,
        references: [...prev.references, ...newRefs]
    }));
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addUrlReference = () => {
    if (!tempUrl.trim()) return;
    const newRef: Reference = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'url',
        name: tempUrl,
        data: tempUrl
    };
    setState(prev => ({ ...prev, references: [...prev.references, newRef] }));
    setTempUrl('');
    setIsAddingRef(null);
  };

  const addNoteReference = () => {
    if (!tempNote.trim()) return;
    const newRef: Reference = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'text',
        name: tempNote.slice(0, 30) + (tempNote.length > 30 ? '...' : ''),
        data: tempNote
    };
    setState(prev => ({ ...prev, references: [...prev.references, newRef] }));
    setTempNote('');
    setIsAddingRef(null);
  };

  const removeReference = (id: string) => {
    setState(prev => ({
        ...prev,
        references: prev.references.filter(r => r.id !== id)
    }));
  };

  // --- End Reference Handling ---

  const handleGenerate = async () => {
    if (!state.topic || state.platforms.length === 0) return;

    setCurrentStep(4);
    setProcessingLogs([]);
    
    // 1. Research
    addLog("🔍 Initiating deep research agent...");
    setState(prev => ({ ...prev, isResearching: true }));
    let research = "";
    try {
        research = await geminiService.performResearch(state.topic);
        addLog("✅ Research complete. Analyzed key trends and context.");
        setState(prev => ({ ...prev, researchData: research, isResearching: false, isGenerating: true }));
    } catch (e) {
        addLog("⚠️ Research failed. Falling back to generic context.");
        setState(prev => ({ ...prev, isResearching: false, isGenerating: true }));
    }

    // 2. Generation per platform
    addLog(`✍️  Drafting content for ${state.platforms.length} platforms in ${state.language}...`);
    
    // Initialize loaders
    const newResults = { ...state.results };
    state.platforms.forEach(p => {
        newResults[p] = { platform: p, text: '', loading: true };
    });
    setState(prev => ({ ...prev, results: newResults }));

    // Execute parallel generation
    await Promise.all(state.platforms.map(async (p) => {
        addLog(`⚡ [${p}] Starting text generation...`);
        try {
            // Updated to pass references
            const text = await geminiService.generatePostText(
                p, 
                state.topic, 
                state.style, 
                research, 
                state.language,
                state.references // Passing references
            );
            addLog(`📝 [${p}] Text drafted.`);
            
            setState(prev => ({
                ...prev,
                results: {
                    ...prev.results,
                    [p]: { ...prev.results[p], text }
                }
            }));

            addLog(`🎨 [${p}] Generating visual asset...`);
            const imageUrl = await geminiService.generatePostImage(p, state.topic, state.style);
            addLog(`🖼️ [${p}] Visual created.`);

            setState(prev => ({
                ...prev,
                results: {
                    ...prev.results,
                    [p]: { platform: p, text, imageUrl, loading: false }
                }
            }));
        } catch (e) {
            addLog(`❌ [${p}] Generation failed.`);
             setState(prev => ({
                ...prev,
                results: {
                    ...prev.results,
                    [p]: { platform: p, text: "Error generating content.", loading: false, error: "Failed" }
                }
            }));
        }
    }));

    addLog("✨ All tasks completed successfully.");
    await new Promise(r => setTimeout(r, 1000));
    setState(prev => ({ ...prev, isGenerating: false }));
    setCurrentStep(5);
  };

  const handleRegenerateText = async (platform: Platform) => {
    setState(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [platform]: { ...prev.results[platform], textLoading: true }
      }
    }));

    try {
      const text = await geminiService.generatePostText(
          platform, 
          state.topic, 
          state.style, 
          state.researchData,
          state.language,
          state.references
      );
      
      setState(prev => ({
        ...prev,
        results: {
          ...prev.results,
          [platform]: { 
            ...prev.results[platform], 
            text, 
            textLoading: false 
          }
        }
      }));
    } catch (e) {
      console.error(`Failed to regenerate text for ${platform}:`, e);
      setState(prev => ({
        ...prev,
        results: {
          ...prev.results,
          [platform]: { ...prev.results[platform], textLoading: false }
        }
      }));
    }
  };

  const handleRegenerateImage = async (platform: Platform) => {
    setState(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [platform]: { ...prev.results[platform], imageLoading: true }
      }
    }));

    try {
      const imageUrl = await geminiService.generatePostImage(platform, state.topic, state.style);
      setState(prev => ({
        ...prev,
        results: {
          ...prev.results,
          [platform]: { 
            ...prev.results[platform], 
            imageUrl, 
            imageLoading: false 
          }
        }
      }));
    } catch (e) {
      console.error(`Failed to regenerate image for ${platform}:`, e);
      setState(prev => ({
        ...prev,
        results: {
          ...prev.results,
          [platform]: { ...prev.results[platform], imageLoading: false }
        }
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      for (const platform of state.platforms) {
        const result = state.results[platform];
        if (!result) continue;

        const folder = zip.folder(platform);
        if (!folder) continue;

        // Add Text
        if (result.text) {
          folder.file(`${platform}-post.txt`, result.text);
        }

        // Add Image
        if (result.imageUrl) {
          if (result.imageUrl.startsWith('data:')) {
            // Handle Base64
            const [meta, data] = result.imageUrl.split(',');
            const mimeMatch = meta.match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/png';
            let ext = 'png';
            if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
            if (mime.includes('webp')) ext = 'webp';
            
            folder.file(`${platform}-image.${ext}`, data, { base64: true });
          } else {
             try {
                const resp = await fetch(result.imageUrl);
                const blob = await resp.blob();
                const mime = blob.type;
                let ext = 'png';
                if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
                if (mime.includes('webp')) ext = 'webp';
                folder.file(`${platform}-image.${ext}`, blob);
             } catch(e) {
                console.error("Could not fetch image for export", e);
             }
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pencraft-assets-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to get platform specific instructions
  const getInstructionText = (platform: Platform) => {
    switch (platform) {
        case Platform.LinkedIn:
            return "Click inside the post editor, paste using Ctrl + V / Cmd + V, review the preview, then click Post.";
        case Platform.Twitter:
            return "Paste using Ctrl + V / Cmd + V inside the post box, review once, then post.";
        case Platform.Instagram:
            return "Click inside the post, paste using Ctrl + V / Cmd + V, wait for the image to appear, then continue sharing.";
        case Platform.Medium:
            return "Place your cursor where the image should appear, paste using Ctrl + V / Cmd + V, review the formatting, then publish when ready.";
        default:
            return "Place your cursor where the image should appear\n\nPaste using Ctrl + V (Windows) or Cmd + V (Mac)\n\nReview the formatting, then publish when ready.";
    }
  };

  const initiatePublish = (platform: Platform) => {
    if (!hasConsented) {
        setShowConsentModal(true);
        return;
    }
    setActivePlatform(platform);
    setShowInstructionModal(true);
  };

  const handleInstructionContinue = () => {
    if (activePlatform) {
        runAutomation(activePlatform);
        setShowInstructionModal(false);
        setActivePlatform(null);
    }
  };

  const handleStartNewProject = () => {
    // Clear Saved State
    localStorage.removeItem('PENCRAFT_PROJECT_STATE');
    localStorage.removeItem('PENCRAFT_CURRENT_STEP');
    
    setShowSuccessModal(false);
    setExecutionStatus({});
    setProcessingLogs([]);
    setState({
        topic: '',
        platforms: [],
        style: WritingStyle.Professional,
        researchData: '',
        results: {} as Record<Platform, GeneratedContent>,
        isResearching: false,
        isGenerating: false,
        language: 'English',
        references: [],
    });
    setCurrentStep(1);
    setActivePlatform(null);
  };

  const runAutomation = async (platform: Platform) => {
    const result = state.results[platform];
    if (!result) return;

    setExecutionStatus(prev => ({
        ...prev,
        [platform]: { status: 'running', log: 'Initializing agent...' }
    }));

    const updateLog = (log: string) => {
        setExecutionStatus(prev => ({
            ...prev,
            [platform]: { ...prev[platform], log }
        }));
    };

    const finalStatus = await automationService.publish(
        platform,
        result.text,
        result.imageUrl,
        updateLog
    );

    // Update final status
    setExecutionStatus(prev => ({
        ...prev,
        [platform]: { 
            status: finalStatus, 
            log: finalStatus === 'success' 
                ? 'Automation sequence complete.' 
                : finalStatus === 'manual_fallback'
                    ? 'Image injected to clipboard. Ready for paste.'
                    : 'Automation failed.' 
        }
    }));

    // Trigger Success Modal on successful completion (either full auto or manual fallback)
    if (finalStatus === 'success' || finalStatus === 'manual_fallback') {
        setTimeout(() => setShowSuccessModal(true), 800);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" ref={scrollRef}>
      
      {/* CONSENT MODAL */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-200 transform scale-100 transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-primary mb-6 mx-auto">
                    <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-center mb-4 text-primary">Enable Browser Automation?</h3>
                <p className="text-secondary text-center mb-6 leading-relaxed">
                    PenCraft AI needs permission to automate your browser tabs to publish posts on your behalf. 
                    <br/><br/>
                    We will open the platform's official site and attempt to insert content. You can watch every step and stop it at any time.
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={() => { setHasConsented(true); setShowConsentModal(false); }}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] duration-200"
                    >
                        Allow Automation
                    </button>
                    <button 
                        onClick={() => setShowConsentModal(false)}
                        className="w-full bg-white text-secondary py-3 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-[0.98] duration-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* INSTRUCTION MODAL (Pre-Automation) */}
      {showInstructionModal && activePlatform && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-200">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-primary mb-6 mx-auto">
                    <Info size={28} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-center mb-4 text-primary">Quick heads up before we continue</h3>
                
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                    <p className="font-semibold text-indigo-900 mb-2">To add the image:</p>
                    <p className="text-indigo-800 text-sm leading-relaxed whitespace-pre-line">
                        {getInstructionText(activePlatform)}
                    </p>
                </div>

                <p className="text-secondary text-center mb-6 text-sm">
                    We’ll open the platform and prepare everything for you.
                </p>
                
                <div className="space-y-3">
                    <button 
                        onClick={handleInstructionContinue}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        Continue <ArrowRight size={18} />
                    </button>
                    <button 
                        onClick={() => { setShowInstructionModal(false); setActivePlatform(null); }}
                        className="w-full bg-white text-secondary py-3 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* SUCCESS MODAL (Post-Automation) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-200 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto animate-slide-up">
                    <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4 text-primary">Post uploaded successfully 🎉</h3>
                <p className="text-secondary mb-8 text-lg leading-relaxed">
                    Your post has been successfully uploaded.<br/>
                    You’re all set.
                </p>
                
                <div className="space-y-3">
                    <button 
                        onClick={handleStartNewProject}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <RefreshCw size={20} /> Start new project
                    </button>
                    <button 
                         onClick={() => setShowSuccessModal(false)}
                         className="w-full bg-white text-secondary py-3 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* GLOBAL HEADER (Moved Up) */}
      <div className="mb-8 md:mb-10 text-center animate-fade-in">
           <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-primary tracking-tight">{getGreeting()}</h1>
           <p className="text-xl md:text-2xl text-secondary font-light">Your creative studio is ready. What's on your mind?</p>
      </div>

      {/* Progress Stepper - Navigable (Moved Down) */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center justify-between relative px-2 md:px-12">
          {/* Track Line Background */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10 rounded-full" />
          {/* Track Line Active */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-1000 -z-10 rounded-full" 
               style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
          
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const Icon = step.icon;
            
            return (
              <button 
                key={step.id} 
                onClick={() => setCurrentStep(step.id)}
                className="group flex flex-col items-center gap-2 md:gap-3 bg-cream px-1 md:px-2 focus:outline-none"
                aria-label={`Go to step ${step.name}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div 
                  className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-out-expo
                    ${isActive ? 'border-primary bg-primary text-white scale-110 shadow-xl shadow-gray-200' : 
                      isCompleted ? 'border-primary bg-white text-primary hover:bg-gray-50' : 
                      'border-gray-200 bg-white text-gray-300 hover:border-gray-300 hover:text-gray-400'}
                  `}
                >
                  <Icon size={isActive ? 16 : 14} className="md:w-5 md:h-5" />
                </div>
                <span className={`text-xs md:text-sm uppercase tracking-widest font-semibold transition-colors duration-300 hidden sm:block ${isActive ? 'text-primary font-bold' : isCompleted ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px] md:min-h-[600px] transition-all duration-700 ease-out-quart">
        
        {/* Step 1: Topic */}
        {currentStep === 1 && (
          <div className="p-6 md:p-12 animate-fade-in flex flex-col h-full justify-between">
             <div className="max-w-3xl mx-auto w-full">

                <div className="mb-8 text-center">
                    {/* Added Topic Element */}
                    <div className="flex flex-col items-center mb-6 animate-fade-in">
                        <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mb-4 bg-white text-primary shadow-sm">
                            <span className="font-serif text-3xl">T</span>
                        </div>
                        <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">TOPIC</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-primary">Topic & Context</h2>
                    <p className="text-secondary text-base md:text-lg">What would you like to create content about today?</p>
                </div>
                
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
                    <textarea
                        value={state.topic}
                        onChange={handleTopicChange}
                        placeholder="e.g. 'The impact of AI on remote work culture' or paste a link to an article..."
                        className="relative w-full h-48 md:h-64 p-6 md:p-8 rounded-xl bg-white border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300 resize-none text-lg md:text-xl leading-relaxed placeholder:text-gray-300 shadow-inner outline-none"
                    />
                </div>
                
                {/* Reference Material Section */}
                <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-fade-in">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Paperclip size={16} /> Reference Material (Optional)
                    </h3>
                    
                    {/* Add Reference Buttons */}
                    {!isAddingRef && (
                        <div className="flex flex-wrap gap-3 mb-4">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all hover:border-gray-300 text-secondary"
                            >
                                <Paperclip size={16} /> Upload File (PDF, TXT)
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".pdf,.txt,.docx,.md"
                                multiple
                                onChange={handleFileUpload}
                            />
                            
                            <button 
                                onClick={() => setIsAddingRef('url')}
                                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all hover:border-gray-300 text-secondary"
                            >
                                <LinkIcon size={16} /> Add Link
                            </button>
                            
                            <button 
                                onClick={() => setIsAddingRef('text')}
                                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all hover:border-gray-300 text-secondary"
                            >
                                <FileText size={16} /> Paste Notes
                            </button>
                        </div>
                    )}

                    {/* Adding URL Interface */}
                    {isAddingRef === 'url' && (
                        <div className="flex gap-2 mb-4 animate-slide-up">
                            <input 
                                type="text"
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                placeholder="Paste URL here..."
                                className="flex-1 p-3 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none text-sm"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && addUrlReference()}
                            />
                            <button 
                                onClick={addUrlReference}
                                disabled={!tempUrl.trim()}
                                className="bg-primary text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-50"
                            >
                                Add
                            </button>
                            <button 
                                onClick={() => { setIsAddingRef(null); setTempUrl(''); }}
                                className="bg-white border border-gray-200 text-secondary px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Adding Note Interface */}
                    {isAddingRef === 'text' && (
                        <div className="flex flex-col gap-2 mb-4 animate-slide-up">
                            <textarea 
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                placeholder="Paste or type notes here..."
                                className="w-full h-24 p-3 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none text-sm resize-none"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button 
                                    onClick={() => { setIsAddingRef(null); setTempNote(''); }}
                                    className="bg-white border border-gray-200 text-secondary px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={addNoteReference}
                                    disabled={!tempNote.trim()}
                                    className="bg-primary text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-50"
                                >
                                    Add Note
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reference List */}
                    {state.references.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {state.references.map((ref) => (
                                <div key={ref.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm shadow-sm group">
                                    {ref.type === 'file' && <Paperclip size={14} className="text-indigo-500" />}
                                    {ref.type === 'url' && <LinkIcon size={14} className="text-blue-500" />}
                                    {ref.type === 'text' && <FileText size={14} className="text-green-500" />}
                                    <span className="truncate max-w-[200px]" title={ref.name}>{ref.name}</span>
                                    <button 
                                        onClick={() => removeReference(ref.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {state.references.length === 0 && !isAddingRef && (
                         <p className="text-sm text-gray-400 italic">Add articles, documents, or notes you want the agent to reference.</p>
                    )}
                </div>

                <div className="mt-8 md:mt-12">
                    <label className="block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Choose Your Persona</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Object.values(WritingStyle).map(style => (
                            <button
                                key={style}
                                onClick={() => setState(s => ({...s, style}))}
                                className={`p-3 rounded-lg text-sm md:text-base border transition-all duration-300 active:scale-[0.98]
                                    ${state.style === style 
                                        ? 'border-primary bg-primary text-white shadow-lg' 
                                        : 'border-gray-200 hover:border-gray-300 text-secondary hover:bg-gray-50'
                                    }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-400 italic">
                        {STYLE_CONFIG[state.style]}
                    </p>
                </div>

                <div className="mt-8 md:mt-12 flex justify-end">
                    <button 
                        onClick={() => setCurrentStep(2)}
                        disabled={!state.topic.trim()}
                        className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-lg font-medium shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Next: Select Language <ChevronRight size={20} />
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Step 2: Language */}
        {currentStep === 2 && (
          <div className="p-6 md:p-12 animate-fade-in">
             <div className="max-w-4xl mx-auto">
                <button onClick={() => setCurrentStep(1)} className="text-sm text-gray-400 hover:text-primary mb-6 md:mb-8 flex items-center gap-1 transition-colors">
                    <ArrowLeft size={16} /> Back to Topic
                </button>
                
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-primary">Select Language</h2>
                    <p className="text-secondary text-base md:text-lg">Choose the primary language for your content generation.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setState(prev => ({ ...prev, language: lang }))}
                            className={`p-4 rounded-xl border text-center transition-all duration-300 active:scale-[0.98]
                                ${state.language === lang 
                                    ? 'border-primary bg-primary text-white shadow-lg transform scale-105' 
                                    : 'border-gray-200 hover:border-gray-300 text-secondary hover:bg-gray-50'
                                }`}
                        >
                            <span className="font-medium">{lang}</span>
                            {state.language === lang && <CheckCircle2 size={16} className="mx-auto mt-2 text-white" />}
                        </button>
                    ))}
                </div>
                
                {!state.language && (
                     <div className="text-center mt-6 text-sm text-orange-500 animate-pulse flex items-center justify-center gap-2">
                         <AlertTriangle size={14} /> Please select a language to proceed.
                     </div>
                )}

                 <div className="mt-12 md:mt-16 flex justify-end">
                    <button 
                        onClick={() => setCurrentStep(3)}
                        className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 text-lg font-medium shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Next: Select Platforms <ChevronRight size={20} />
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Step 3: Platforms */}
        {currentStep === 3 && (
          <div className="p-6 md:p-12 animate-fade-in">
             <div className="max-w-5xl mx-auto">
                <button onClick={() => setCurrentStep(2)} className="text-sm text-gray-400 hover:text-primary mb-6 md:mb-8 flex items-center gap-1 transition-colors">
                    <ArrowLeft size={16} /> Back to Language
                </button>
                
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-primary">Select Channels</h2>
                    <p className="text-secondary text-base md:text-lg">Where should this content live? We'll adapt the message for each.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
                        const isSelected = state.platforms.includes(key as Platform);
                        const Icon = config.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => togglePlatform(key as Platform)}
                                className={`group relative p-6 md:p-8 rounded-2xl border transition-all duration-300 h-full active:scale-[0.98]
                                    ${isSelected 
                                        ? 'border-primary bg-primary text-white shadow-xl shadow-gray-200 transform -translate-y-1' 
                                        : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4 md:mb-6">
                                    <Icon size={28} className={`transition-colors duration-300 ${isSelected ? 'text-white' : config.color}`} />
                                    {isSelected && <CheckCircle2 size={24} className="text-white animate-fade-in" />}
                                </div>
                                <h3 className={`text-xl font-bold mb-2 text-left transition-colors duration-300 ${isSelected ? 'text-white' : 'text-primary'}`}>{key}</h3>
                                <p className={`text-base text-left leading-relaxed transition-colors duration-300 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>{config.description}</p>
                            </button>
                        );
                    })}
                </div>

                 <div className="mt-8 md:mt-12 flex justify-end">
                    <button 
                        onClick={handleGenerate}
                        disabled={state.platforms.length === 0}
                        className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] text-lg font-medium"
                    >
                        <Wand2 size={20} /> Start Magic
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Step 4: Processing (Terminal Log) */}
        {currentStep === 4 && (
            <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px] animate-fade-in bg-gray-900 text-green-400 font-mono">
                <div className="w-full max-w-2xl">
                    <div className="flex items-center gap-2 mb-6 text-gray-500 border-b border-gray-800 pb-4">
                        <Terminal size={20} />
                        <span className="text-sm">PenCraft AI v2.5.0</span>
                    </div>
                    
                    <div 
                        ref={logsContainerRef}
                        className="space-y-3 h-[300px] md:h-[400px] overflow-y-auto p-4 custom-scrollbar"
                    >
                        {processingLogs.map((log, idx) => (
                            <div key={idx} className="flex gap-3 animate-fade-in text-sm md:text-base">
                                <span className="opacity-50 shrink-0">{new Date().toLocaleTimeString()}</span>
                                <span>{log}</span>
                            </div>
                        ))}
                        {state.isGenerating || state.isResearching ? (
                            <div className="flex gap-2 items-center text-green-600 animate-pulse">
                                <span className="w-2 h-4 bg-green-600 block"></span>
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center text-gray-500 text-xs md:text-sm">
                        <span>Tasks: {state.platforms.length * 2 + 1}</span>
                        <span>Status: {state.isGenerating ? "Processing..." : "Complete"}</span>
                    </div>
                </div>
            </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
            <div className="flex flex-col h-full animate-fade-in">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-white sticky top-0 z-10 shadow-sm transition-all duration-500 gap-4 md:gap-0">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-serif font-bold text-primary">Review & Publish</h2>
                        <p className="text-sm text-secondary">Ready to ship to your audience.</p>
                    </div>
                    <div className="flex gap-3 items-center w-full md:w-auto">
                        <button 
                            onClick={() => setShowResearch(!showResearch)}
                            className="flex-1 md:flex-none text-sm md:text-base font-medium text-secondary hover:text-primary flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                        >
                            <BookOpen size={16} /> {showResearch ? 'Hide Research' : 'View Research'}
                        </button>

                        <button 
                            onClick={handleExportAll}
                            disabled={isExporting}
                            className="flex-1 md:flex-none text-sm md:text-base font-medium text-primary hover:text-white flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-full border border-primary hover:bg-primary transition-all duration-300 disabled:opacity-50"
                        >
                           {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                           Export All
                        </button>
                        
                         <button 
                            onClick={() => setCurrentStep(6)} 
                            className="flex-1 md:flex-none bg-primary text-white text-sm md:text-base font-medium px-6 py-3 md:py-2 rounded-full hover:bg-gray-800 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg md:ml-2 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Research Panel (Collapsible) */}
                {showResearch && (
                    <div className="bg-amber-50 border-b border-amber-100 p-6 md:p-8 animate-slide-up">
                        <div className="max-w-4xl mx-auto">
                            <h3 className="font-serif font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
                                <Sparkles size={18} /> Research Brief
                            </h3>
                            <div className="prose prose-sm text-amber-900/80 max-w-none whitespace-pre-wrap">
                                {state.researchData}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex-grow bg-gray-50 p-4 md:p-12 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-8 md:gap-12 max-w-4xl mx-auto">
                        {state.platforms.map((platform) => {
                            const result = state.results[platform];
                            const Config = PLATFORM_CONFIG[platform];
                            if(!result) return null;

                            return (
                                <div key={platform} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-500 ease-out">
                                    {/* Header */}
                                    <div className={`px-6 md:px-8 py-4 border-b border-gray-100 flex items-center justify-between ${Config.bgColor}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-white`}>
                                                <Config.icon size={20} className={Config.color} />
                                            </div>
                                            <span className={`font-bold ${Config.color}`}>{platform}</span>
                                        </div>
                                        <span className="text-sm font-mono text-gray-500 uppercase tracking-wider">Draft</span>
                                    </div>

                                    <div className="flex flex-col md:flex-row">
                                        {/* Content Preview */}
                                        <div className="w-full md:w-3/5 p-5 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 relative">
                                            {/* Text */}
                                            {result.textLoading && (
                                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-bl-3xl">
                                                    <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 text-primary text-sm font-medium animate-pulse">
                                                        <Loader2 size={16} className="animate-spin" /> Rewriting content...
                                                    </div>
                                                </div>
                                            )}
                                            {/* Mobile: Use font-sans for better readability and mimicking actual social UI */}
                                            <div className={`font-sans text-gray-900 whitespace-pre-wrap leading-relaxed text-[15px] md:text-base transition-opacity duration-300 ${result.textLoading ? 'opacity-30' : 'opacity-100'}`}>
                                                {result.text}
                                            </div>
                                            
                                            {/* Image */}
                                            {(result.imageUrl || result.imageLoading) && (
                                                <div className="mt-6 rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative min-h-[200px] bg-gray-50 flex items-center justify-center">
                                                    {result.imageLoading && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                                                            <Loader2 size={32} className="animate-spin text-primary" />
                                                        </div>
                                                    )}
                                                    {result.imageUrl ? (
                                                        <img src={result.imageUrl} alt="Generated visual" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700 ease-in-out" />
                                                    ) : (
                                                        <div className="text-gray-400 text-sm">Generating visual...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions Panel */}
                                        <div className="w-full md:w-2/5 p-5 md:p-8 bg-gray-50/50 flex flex-col justify-center gap-6 md:gap-4">
                                            <div className="mb-auto">
                                                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                                    <PenTool size={16} /> AI Notes
                                                </h4>
                                                <p className="text-sm text-secondary leading-relaxed">
                                                    This post is optimized for engagement on {platform}. It uses a {state.style} tone and includes generated visual assets.
                                                </p>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-500">
                                                        {result.text.length} chars
                                                    </span>
                                                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-500">
                                                        {state.style}
                                                    </span>
                                                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-500">
                                                        {state.language}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <button 
                                                    onClick={() => copyToClipboard(result.text)}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 text-primary rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-[0.98] hover:border-gray-300 duration-200"
                                                >
                                                    <Copy size={18} /> Copy Text
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleRegenerateText(platform)}
                                                    disabled={result.textLoading}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 text-primary rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-[0.98] hover:border-gray-300 disabled:opacity-50 duration-200"
                                                >
                                                    <RefreshCw size={18} className={result.textLoading ? "animate-spin" : ""} />
                                                    {result.textLoading ? "Rewriting..." : "Regenerate Text"}
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleRegenerateImage(platform)}
                                                    disabled={result.imageLoading}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 text-primary rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-[0.98] hover:border-gray-300 disabled:opacity-50 duration-200"
                                                >
                                                    <ImageIcon size={18} className={result.imageLoading ? "animate-spin" : ""} />
                                                    {result.imageLoading ? "Regenerating..." : "Regenerate Image"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     <div className="flex justify-center mt-12 mb-8">
                         <button 
                            onClick={() => setCurrentStep(6)} 
                            className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 text-lg font-medium shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Next: Publish <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Step 6: Execute Automation */}
        {currentStep === 6 && (
             <div className="p-6 md:p-12 animate-fade-in flex flex-col h-full">
                <div className="text-center mb-8 md:mb-12">
                     <button onClick={() => setCurrentStep(5)} className="text-sm text-gray-400 hover:text-primary mb-6 md:mb-8 flex items-center gap-1 transition-colors mx-auto">
                        <ArrowLeft size={16} /> Back to Review
                    </button>
                    <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-primary">Execute & Publish</h2>
                    <p className="text-secondary text-base md:text-lg">Initialize PenCraft AI to publish on your behalf.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto w-full">
                    {state.platforms.map(platform => {
                        const result = state.results[platform];
                        const Config = PLATFORM_CONFIG[platform];
                        const execState = executionStatus[platform] || { status: 'idle', log: 'Ready' };
                        const isRunning = execState.status === 'running';
                        const isSuccess = execState.status === 'success';
                        const isFallback = execState.status === 'manual_fallback';

                        if (!result) return null;

                        return (
                            <div key={platform} className={`bg-white rounded-2xl shadow-sm border ${isRunning ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-gray-100'} p-6 transition-all duration-300 flex flex-col relative overflow-hidden group hover:shadow-lg`}>
                                
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-xl ${Config.bgColor}`}>
                                        <Config.icon size={24} className={Config.color} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-bold text-lg text-primary truncate">{platform}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${
                                                isRunning ? 'bg-yellow-400' : 
                                                isSuccess ? 'bg-green-500' : 
                                                isFallback ? 'bg-orange-500' : 'bg-gray-300'
                                            }`} />
                                            <span className="text-sm font-mono text-gray-500 truncate">{execState.log}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Terminal UI for Status */}
                                <div className="bg-gray-900 rounded-lg p-4 mb-6 font-mono text-sm h-24 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                                    <div className={isFallback ? "text-orange-400" : "text-green-400"}>
                                        <span className="opacity-50 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                                        {execState.log}
                                    </div>
                                    {isRunning && <div className="text-gray-500 italic">... processing ...</div>}
                                </div>

                                <div className="space-y-3 mt-auto">
                                    {/* Warnings / Hints */}
                                    {isFallback && (
                                        <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-sm flex gap-2 items-start border border-orange-100">
                                            <FileWarning size={14} className="shrink-0 mt-0.5" />
                                            <span>
                                                <b>Ready to Paste:</b> Image is in your clipboard. Press Ctrl+V when the page loads.
                                            </span>
                                        </div>
                                    )}

                                    {/* Execute Button */}
                                    <button
                                        onClick={() => initiatePublish(platform)}
                                        disabled={isRunning}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-4 text-white rounded-xl font-bold transition-all duration-300 shadow-md hover:-translate-y-0.5 active:scale-[0.98]
                                            ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 
                                              isFallback ? 'bg-gray-800 hover:bg-gray-900' :
                                              'bg-primary hover:bg-indigo-900'}
                                            ${isRunning ? 'opacity-75 cursor-wait' : ''}
                                        `}
                                    >
                                        {isRunning ? (
                                            <Loader2 size={18} className="animate-spin text-white" />
                                        ) : isSuccess ? (
                                            <CheckCircle2 size={18} />
                                        ) : (
                                            <PlayCircle size={18} />
                                        )}
                                        {isRunning ? "Agent Running..." : 
                                         isSuccess ? "Published" : 
                                         isFallback ? "Execute Again" : 
                                         "Execute Auto-Publish"}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-12 md:mt-16 text-center">
                    <button 
                        onClick={() => setCurrentStep(1)}
                        className="text-secondary hover:text-primary font-medium flex items-center gap-2 mx-auto px-6 py-3 rounded-full hover:bg-gray-100 transition-all duration-300 active:scale-[0.98]"
                    >
                        <RefreshCw size={18} /> Start New Project
                    </button>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};