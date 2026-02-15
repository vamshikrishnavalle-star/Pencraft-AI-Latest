
export type View = 'home' | 'features' | 'pricing' | 'about' | 'dashboard' | 'newsletter' | 'presentation';

export enum Platform {
  LinkedIn = 'LinkedIn',
  Twitter = 'X (Twitter)',
  Instagram = 'Instagram',
  Facebook = 'Facebook',
  Threads = 'Threads',
  Medium = 'Medium',
  Substack = 'Substack',
  Reddit = 'Reddit',
  Quora = 'Quora',
  YouTube = 'YouTube',
  Podcast = 'Podcasts',
  Blog = 'Blogs'
}

export enum WritingStyle {
  Professional = 'Professional',
  Viral = 'Viral/Hormozi',
  Casual = 'Casual',
  Technical = 'Technical',
  Storyteller = 'Storyteller'
}

export enum NewsletterDepth {
  Brief = 'Brief Overview',
  Balanced = 'Balanced Insight',
  Deep = 'Deep Dive'
}

export enum PresentationType {
  StartupPitch = 'Startup Pitch',
  SalesDeck = 'Sales Deck',
  InvestorUpdate = 'Investor Update',
  ProductWalkthrough = 'Product Walkthrough',
  InternalPresentation = 'Internal Presentation'
}

export enum PresentationTone {
  Persuasive = 'Persuasive',
  Professional = 'Professional',
  Inspiring = 'Inspiring',
  Educational = 'Educational',
  Urgent = 'Urgent'
}

export interface GeneratedContent {
  platform: Platform;
  text: string;
  imageUrl?: string;
  loading: boolean;
  imageLoading?: boolean;
  textLoading?: boolean;
  error?: string;
}

export interface Reference {
  id: string;
  type: 'file' | 'url' | 'text';
  data: string; // URL, text content, or base64 file data
  name?: string; // Filename or truncated text/url
  mimeType?: string; // For files
}

export interface ProjectState {
  topic: string;
  platforms: Platform[];
  style: WritingStyle;
  researchData: string;
  results: Record<Platform, GeneratedContent>;
  isResearching: boolean;
  isGenerating: boolean;
  language: string;
  references: Reference[];
}

export interface ResearchResponse {
  summary: string;
  keyPoints: string[];
  audience: string;
}

export interface SlideContent {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
  visualSuggestion: string;
}

export interface PresentationResult {
  title: string;
  slides: SlideContent[];
}