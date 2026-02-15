
import { Platform, WritingStyle } from './types';
import { 
  Linkedin, Twitter, Instagram, Facebook, FileText, MessageCircle, 
  Mail, MessageSquare, HelpCircle, Youtube, Mic, Globe 
} from 'lucide-react';

// PLATFORM_CONFIG now focuses on the "Entry Point" for automation
export const PLATFORM_CONFIG = {
  [Platform.LinkedIn]: {
    icon: Linkedin,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    maxLength: 3000,
    description: "Professional, insightful, credibility-focused.",
    url: "https://www.linkedin.com/feed/", // Automation target: Feed (where "Start a post" lives)
  },
  [Platform.Twitter]: {
    icon: Twitter,
    color: 'text-black',
    bgColor: 'bg-gray-50',
    maxLength: 280,
    description: "Short-form opinions, threads, sharp commentary.",
    url: "https://twitter.com/compose/tweet", // Automation target: Direct composer
  },
  [Platform.Instagram]: {
    icon: Instagram,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    maxLength: 2200,
    description: "Conversational, relatable, expressive visual-first.",
    url: "https://www.instagram.com/", // Automation target: Home (Plus button)
  },
  [Platform.Facebook]: {
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    maxLength: 5000,
    description: "Personal, engaging, community-driven.",
    url: "https://www.facebook.com/", // Automation target: Home (What's on your mind)
  },
  [Platform.Threads]: {
    icon: MessageCircle,
    color: 'text-black',
    bgColor: 'bg-gray-50',
    maxLength: 500,
    description: "Quick, casual updates and opinions.",
    url: "https://www.threads.net/create", // Automation target: Create page
  },
  [Platform.Medium]: {
    icon: FileText,
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    maxLength: 10000,
    description: "Article-focused, structured, deeper perspectives.",
    url: "https://medium.com/new-story",
  },
  [Platform.Substack]: {
    icon: Mail,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    maxLength: 10000,
    description: "Newsletter-style, direct audience engagement.",
    url: "https://substack.com/publish/post",
  },
  [Platform.Reddit]: {
    icon: MessageSquare,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    maxLength: 5000,
    description: "Informative, value-first, community-specific.",
    url: "https://www.reddit.com/submit",
  },
  [Platform.Quora]: {
    icon: HelpCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    maxLength: 5000,
    description: "Authoritative answers demonstrating expertise.",
    url: "https://www.quora.com/",
  },
  [Platform.YouTube]: {
    icon: Youtube,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    maxLength: 5000,
    description: "Community posts & video scripts.",
    url: "https://studio.youtube.com/",
  },
  [Platform.Podcast]: {
    icon: Mic,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    maxLength: 10000,
    description: "Scripts & show notes, natural spoken language.",
    url: "https://podcasters.spotify.com/",
  },
  [Platform.Blog]: {
    icon: Globe,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    maxLength: 15000,
    description: "SEO-friendly, structured long-form content.",
    url: "https://wordpress.com/post",
  }
};

export const STYLE_CONFIG = {
  [WritingStyle.Professional]: "Corporate, clean, authoritative, value-driven.",
  [WritingStyle.Viral]: "Punchy, short sentences, strong hooks, high engagement (Alex Hormozi style).",
  [WritingStyle.Casual]: "Friendly, relatable, easy to read, uses slang appropriately.",
  [WritingStyle.Technical]: "Detailed, data-driven, jargon-heavy where appropriate, expert.",
  [WritingStyle.Storyteller]: "Narrative-driven, emotional, journey-focused."
};
