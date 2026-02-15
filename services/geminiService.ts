import { GoogleGenAI, Type } from "@google/genai";
import { Platform, WritingStyle, NewsletterDepth, PresentationType, PresentationTone, PresentationResult, Reference } from "../types";

// Lazy load the AI client. 
// This prevents the app from crashing on startup if the API key is invalid or the environment isn't fully loaded.
const getAi = () => {
  // safe access to process.env.API_KEY via the polyfill or build injection
  const apiKey = process.env.API_KEY || ''; 
  return new GoogleGenAI({ apiKey });
};

const PENCRAFT_SYSTEM_INSTRUCTION = `You are "PenCraft AI", a platform-aware personal AI ghostwriter designed to create publish-ready content across multiple platforms while preserving the user’s voice and intent.

Your primary goal is to transform a single idea or reference set into platform-optimized text and visuals that follow native platform rules automatically.

RULE 1. CORE IDENTITY
PenCraft AI is not a generic writing assistant.
You operate as a publishing-first system that adapts content for each platform by default.

RULE 2. PLATFORM AWARENESS (CRITICAL)
Always generate distinct outputs per platform.
Never reuse the same text structure across platforms.
Respect platform-specific constraints such as length, tone, formatting, and audience expectations.

RULE 3. SINGLE SOURCE OF TRUTH
Only use information provided by the user through uploaded files, URLs, or notes.
Do not introduce external facts or assumptions.
If information is missing or unclear, signal uncertainty rather than hallucinating.

RULE 4. VOICE AND PERSONA CONSISTENCY
Strictly follow the selected persona and tone.
Maintain consistent voice across all platforms unless explicitly instructed otherwise.
Do not overwrite the user’s intent with generic marketing language.

RULE 5. TEXT AND VISUAL CO-GENERATION
Always generate text and visuals together when visual output is enabled.
Ensure visuals match the message, tone, and platform style of the text.
Automatically apply correct aspect ratios per platform.

RULE 6. CLARITY OVER CREATIVITY
Prioritize clarity, accuracy, and usefulness over poetic or abstract language.
Avoid filler, hype, or vague claims unless the persona explicitly allows it.

RULE 7. EXPLAINABILITY
Provide internal reasoning notes when enabled, explaining why content was structured in a specific way for a platform.
These notes should be concise, factual, and non-promotional.

RULE 8. GRANULAR CONTROL
Respect user requests for partial regeneration.
If asked to rewrite text only, visuals must remain unchanged.
If asked to re-roll visuals only, text must remain unchanged.

RULE 9. FORMATTING DISCIPLINE
Do not use unnecessary symbols, emojis, or decorative formatting unless the platform requires it.
Avoid markdown formatting unless the output target explicitly supports it.
Keep spacing clean and readable.

PLAIN TEXT ENFORCEMENT
All outputs must be clean plain text.

Do not use:
Asterisks
Bullet symbols
Leading dashes
Decorative list markers
Markdown formatting
Bold, italics, or special characters for emphasis

If input contains these symbols, automatically normalize them into clean structured text.
Headings may be separated by spacing only.
Lists must be converted into clean paragraph blocks with line separation.
Never preserve star or dash based formatting.

This rule overrides stylistic preferences.

RULE 10. OUTPUT READINESS
All outputs must be immediately publish-ready.
Do not include meta commentary, explanations, or system language in final content.
Never require the user to manually adapt content after generation.

RULE 11. MULTI-LANGUAGE CONSISTENCY
When generating content in multiple languages, preserve meaning, tone, and intent rather than literal translation.
Respect cultural norms of the target language and platform.

RULE 12. FAILURE HANDLING
If a request cannot be fulfilled accurately due to missing data or platform limitations, generate the best possible approximation and append a brief note explaining the limitation. Do not fail silently.`;

const PLATFORM_RULES: Record<Platform, string> = {
  [Platform.LinkedIn]: "Professional, authoritative, credibility-focused. Structured paragraphs and bullet points. Insight-driven, thought leadership tone. Clear hook + value + conclusion. Minimal emojis.",
  [Platform.Twitter]: "Short, sharp, opinionated. Punchy one-liners or threads. High-impact hooks. Minimal explanation, maximum clarity. No corporate language.",
  [Platform.Instagram]: "Conversational and expressive. Short paragraphs or line breaks. Emotion-driven storytelling. Relatable tone. Light emoji usage allowed.",
  [Platform.Facebook]: "Casual, friendly, community-oriented. Story-style writing. Invites discussion and comments. Warm, personal tone.",
  [Platform.Threads]: "Informal, fast, conversational. Opinion-first writing. Short updates or thoughts. Feels like a real-time conversation.",
  [Platform.Medium]: "Long-form, structured articles. Clear sections and logical flow. Depth, clarity, and thoughtful explanations. Professional but human tone.",
  [Platform.Substack]: "Newsletter-style writing. Personal insights and reflections. Direct address to the reader. Trust-building and consistent voice.",
  [Platform.Reddit]: "Informative and value-first. Non-promotional tone. Context-aware to subreddit culture. Clear explanations and insights. Authentic and human.",
  [Platform.Quora]: "Clear, concise, and authoritative. Directly answers the question. Educational and structured. Demonstrates expertise without arrogance.",
  [Platform.YouTube]: "Engaging and conversational. Clear pacing and verbal flow. Designed for spoken delivery. Strong opening hook. (Focus on Community Posts or short Video Scripts).",
  [Platform.Podcast]: "Natural spoken language. Smooth transitions. Audience-friendly pacing. Clear talking points.",
  [Platform.Blog]: "SEO-friendly structure. Clear headings and subheadings. Informative, readable, and skimmable. Balanced depth and clarity."
};

const IMAGE_STYLE_RULES: Record<Platform, string> = {
  [Platform.LinkedIn]: "Clean, professional, minimal, neutral colors. Business or office context.",
  [Platform.Twitter]: "High-contrast, minimal, text-forward (if applicable). Punchy visuals.",
  [Platform.Instagram]: "Bold, expressive, vibrant visuals. Aesthetic and lifestyle focused.",
  [Platform.Facebook]: "Warm, community-focused, relatable, people-oriented.",
  [Platform.Threads]: "Minimalist, conversational, clean.",
  [Platform.Medium]: "Editorial, calm, typography-focused, abstract and sophisticated.",
  [Platform.Substack]: "Artistic, illustration-style, editorial, story-driven.",
  [Platform.Reddit]: "Authentic, raw, informative (infographic style if applicable), or meme-adjacent high quality.",
  [Platform.Quora]: "Educational, clear, diagrammatic or clean editorial.",
  [Platform.YouTube]: "High energy, thumbnail-style, clickable, vibrant, high contrast.",
  [Platform.Podcast]: "Album art style, atmospheric, moody or brand-focused.",
  [Platform.Blog]: "Wide editorial, detailed, relevant to topic, stock-photo quality but artistic."
};

const IMAGE_ASPECT_RATIOS: Record<Platform, string> = {
  [Platform.LinkedIn]: "3:4", 
  [Platform.Twitter]: "16:9",
  [Platform.Instagram]: "3:4", 
  [Platform.Facebook]: "3:4", 
  [Platform.Threads]: "3:4", 
  [Platform.Medium]: "16:9",
  [Platform.Substack]: "16:9",
  [Platform.Reddit]: "16:9",
  [Platform.Quora]: "16:9",
  [Platform.YouTube]: "16:9",
  [Platform.Podcast]: "1:1",
  [Platform.Blog]: "16:9"
};

const sanitizeOutput = (text: string): string => {
  return text
    .replace(/^\s*[-*•]\s+/gm, "") 
    .replace(/\*\*/g, "")          
    .replace(/\*/g, "");           
};

const validateOutput = (text: string | undefined): string => {
  if (!text) return "Content could not be generated. Please try again.";
  return sanitizeOutput(text);
};

export const performResearch = async (topic: string): Promise<string> => {
  const prompt = `
      TOPIC: "${topic}"

      Please provide a structured research summary including:
      1. A brief definition/background.
      2. 3-5 Key trends or facts relevant to the current year.
      3. Common misconceptions or challenges.
      4. A "Hook" angle - what is the most interesting part of this topic?
      
      Keep it concise but dense with usable information.
    `;

  try {
      const response = await getAi().models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Research Agent.",
          thinkingConfig: { thinkingBudget: 2048 }
        }
      });
      return validateOutput(response.text);
  } catch (e1: any) {
      console.warn("Tier 1 (Pro) failed, attempting Tier 2 (Flash)", e1);
      
      try {
          const response = await getAi().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
              systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Research Agent.",
              thinkingConfig: { thinkingBudget: 2048 }
            }
          });
          return validateOutput(response.text);
      } catch (e2: any) {
          console.warn("Tier 2 (Flash) failed, attempting Tier 3 (2.0 Flash Exp)", e2);

          try {
             const response = await getAi().models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: {
                  systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Research Agent."
                }
             });
             return validateOutput(response.text);
          } catch (e3) {
             console.error("All research tiers failed. Falling back to 1.5 Flash.", e3);
             try {
                const response = await getAi().models.generateContent({
                    model: 'gemini-1.5-flash',
                    contents: prompt,
                    config: {
                      systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Research Agent."
                    }
                });
                return validateOutput(response.text);
             } catch (e4) {
                return "Research unavailable. Proceeding with topic knowledge.";
             }
          }
      }
  }
};

export const generatePostText = async (
  platform: Platform,
  topic: string,
  style: WritingStyle,
  research: string,
  language: string,
  references: Reference[] = []
): Promise<string> => {
    const textReferences = references
      .filter(ref => ref.type !== 'file' || !ref.mimeType?.includes('pdf'))
      .map(ref => `[Reference Type: ${ref.type}] ${ref.name}: ${ref.data}`)
      .join('\n\n');

    const fileParts = references
      .filter(ref => ref.type === 'file' && ref.mimeType?.includes('pdf'))
      .map(ref => ({
        inlineData: {
          mimeType: ref.mimeType!,
          data: ref.data
        }
      }));

    const textPrompt = `
      🧩 Inputs
      1. Topic:
      "${topic}" 

      2. Reference Material (USER PROVIDED - SOURCE OF TRUTH):
      ${textReferences || "No text references provided. See attached files if any."}

      3. Platform:
      ${platform}

      4. Tone / Style:
      ${style}

      5. Output Language:
      ${language}

      6. Research Context (Supplementary):
      ${research}

      7. Platform Rules:
      ${PLATFORM_RULES[platform]}

      OUTPUT FORMAT:
      Generate only the post text followed by relevant hashtags. Do not include image prompts.
    `;

    const contents = [
      ...fileParts,
      { text: textPrompt }
    ];

    // TIER 1: Gemini 3 Pro (Most capable)
    try {
      const response = await getAi().models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: contents as any },
        config: {
          systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 4096 },
          temperature: 0.7,
        }
      });
      return validateOutput(response.text);
    } catch (e1: any) {
      console.warn(`Tier 1 (Pro) Text failed for ${platform}. Trying Tier 2 (3-Flash).`, e1);
      
      // TIER 2: Gemini 3 Flash (Fast & Smart)
      try {
          const response = await getAi().models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: { parts: contents as any },
              config: {
                  systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION,
                  thinkingConfig: { thinkingBudget: 4096 },
                  temperature: 0.7,
              }
          });
          return validateOutput(response.text);
      } catch (e2: any) {
         console.warn(`Tier 2 (3-Flash) Text failed for ${platform}. Trying Tier 3 (2.0-Flash-Exp).`, e2);

         // TIER 3: Gemini 2.0 Flash Exp (Recent stable)
         try {
             const response = await getAi().models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: { parts: contents as any },
                config: {
                    systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION,
                    temperature: 0.7,
                }
             });
             return validateOutput(response.text);
         } catch (e3) {
            console.error(`Tier 3 (2.0-Flash-Exp) failed for ${platform}. Trying Tier 4 (1.5-Flash GA).`, e3);
            
            // TIER 4: Gemini 1.5 Flash (Production GA - Ultimate Safety Net)
            try {
                const response = await getAi().models.generateContent({
                   model: 'gemini-1.5-flash',
                   contents: { parts: contents as any },
                   config: {
                       systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION,
                       temperature: 0.7,
                   }
                });
                return validateOutput(response.text);
            } catch (e4) {
                 console.error(`All text tiers failed for ${platform}.`, e4);
                 return "Unable to generate content due to high traffic or API limits. Please try again in a moment.";
            }
         }
      }
    }
};

export const generatePostImage = async (
  platform: Platform,
  topic: string,
  style: WritingStyle
): Promise<string | undefined> => {
  try {
    const promptGenerationPrompt = `
      Your task is to analyze the provided post content and generate ONE elite, scroll-stopping image generation prompt suitable for ${platform}.

      INPUTS:
      - Topic: "${topic}"
      - Style: "${style}"
      - Platform Constraints: ${IMAGE_STYLE_RULES[platform]}

      VISUAL STYLE (MANDATORY):
      • Flat or semi-flat digital illustration / UI-centric design
      • No 3D, no CGI, no photorealism
      • Modern SaaS marketing aesthetic
      • Clean layouts with soft depth using shadows and gradients

      COLOR SYSTEM:
      Use premium gradients suited to the topic (e.g., Blue/Cyan/Gold for Fintech/Business, Purple/Indigo for Tech/SaaS, Warm tones for Lifestyle if applicable).

      MANDATORY ELEMENT:
      • Always include the text "@PenCraftAI" in the prompt description (e.g., "small footer text '@PenCraftAI' placed subtly").

      PROMPT OUTPUT FORMAT (STRICT):
      Output ONE single-sentence image prompt following this structure:
      "Modern flat digital illustration of [main concept based on topic], featuring [UI elements or visual metaphor], clean gradient background in [color palette], soft shadows and subtle glow accents, premium SaaS marketing aesthetic, balanced social-media composition, minimal and trustworthy design, small footer text '@PenCraftAI' placed subtly at the bottom"

      CRITICAL RULES:
      ✓ Output ONLY the image prompt string.
      ✓ No explanations, no markdown.
      ✓ One continuous sentence.
    `;

    let imagePrompt = "";
    try {
        const promptResponse = await getAi().models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: promptGenerationPrompt,
            config: { systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Senior Visual Prompt Architect." }
        });
        imagePrompt = validateOutput(promptResponse.text);
    } catch (e) {
        try {
            const promptResponse = await getAi().models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: promptGenerationPrompt,
                config: { systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Senior Visual Prompt Architect." }
            });
            imagePrompt = validateOutput(promptResponse.text);
        } catch (e2) {
            imagePrompt = `Modern flat digital illustration of ${topic}, premium SaaS aesthetic, text '@PenCraftAI'`;
        }
    }

    if (!imagePrompt || imagePrompt.includes("Content could not be generated")) return undefined;

    // USE FLASH IMAGE (Production Ready)
    try {
        const response = await getAi().models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: imagePrompt }] },
          config: {
            imageConfig: {
              aspectRatio: IMAGE_ASPECT_RATIOS[platform] as any,
              // numberOfImages removed for Flash compatibility
            }
          }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    } catch (error) {
        console.error("Image generation failed", error);
    }
    
    return undefined;
  } catch (error) {
    console.error(`Image Generation Error (${platform}):`, error);
    return undefined;
  }
};

export const generateNewsletter = async (
  topic: string,
  notes: string,
  audience: string,
  tone: WritingStyle,
  depth: NewsletterDepth
): Promise<string> => {
    const prompt = `
      TASK:
      Create a comprehensive, polished newsletter draft based on the following inputs.
      
      INPUTS:
      - Core Topic: "${topic}"
      - User Notes/Context: "${notes}"
      - Target Audience: "${audience}"
      - Tone: ${tone}
      - Desired Depth: ${depth}

      INSTRUCTIONS:
      1. ANALYZE the topic. Identify the "Why it matters" and the "How it affects the reader".
      2. EXPAND on the user's notes. Do not just repeat them; add context, counter-arguments, or future implications.
      3. STRUCTURE the newsletter based on the '${depth}' setting:
         - If '${NewsletterDepth.Brief}': Focus on brevity, punchy bullet points, and one clear takeaway.
         - If '${NewsletterDepth.Balanced}': Provide a strong narrative hook, main analysis, and practical application.
         - If '${NewsletterDepth.Deep}': Provide a comprehensive deep dive, historical context (if relevant), detailed analysis, and strategic insights.

      FORMATTING REQUIREMENTS:
      - Subject Line: Provide 3 distinct options (Punchy, Curious, Benefit-driven).
      - Preview Text: 1 concise sentence.
      - Body: Use clear headings, short paragraphs, and formatting (bolding/italics) for readability.
      - Conclusion: A clear closing thought or call to action.

      TONE GUIDANCE:
      The writing should feel like a human expert talking to their audience. Insightful, personal, and valuable.
    `;

    try {
      const response = await getAi().models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Newsletter Agent.",
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 4096 } 
        }
      });
      return validateOutput(response.text);
    } catch (e1: any) {
        try {
            const response = await getAi().models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Newsletter Agent.",
                    temperature: 0.7,
                    thinkingConfig: { thinkingBudget: 4096 }
                }
            });
            return validateOutput(response.text);
        } catch (e2: any) {
            try {
                const response = await getAi().models.generateContent({
                    model: 'gemini-2.0-flash-exp',
                    contents: prompt,
                    config: {
                        systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Newsletter Agent.",
                        temperature: 0.7
                    }
                });
                return validateOutput(response.text);
            } catch (e3) {
                 return "Unable to generate newsletter at this time. Please try again.";
            }
        }
    }
};

export const generatePresentation = async (
  topic: string,
  type: PresentationType,
  audience: string,
  tone: PresentationTone,
  slideCount: number,
  notes: string
): Promise<PresentationResult | null> => {
    const prompt = `
      Task: Create a structured presentation deck based on the following inputs.

      Topic: "${topic}"
      Type: ${type}
      Target Audience: "${audience}"
      Tone: ${tone}
      Target Slide Count: ${slideCount}
      Additional Notes: "${notes}"

      Output a JSON object with a title for the deck and an array of slides.
      Each slide should have a title, key bullet points (3-5), speaker notes (narrative script for the presenter), and a visual suggestion (what image/chart should be on the slide).
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            slides: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        slideNumber: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                        speakerNotes: { type: Type.STRING },
                        visualSuggestion: { type: Type.STRING }
                    }
                }
            }
        }
    };

    try {
      const response = await getAi().models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Presentation Agent.",
          thinkingConfig: { thinkingBudget: 2048 },
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      
      const text = validateOutput(response.text);
      if (text && !text.includes("Content could not be generated")) return JSON.parse(text) as PresentationResult;
    } catch (e1) {
        try {
            const response = await getAi().models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Presentation Agent.",
                    thinkingConfig: { thinkingBudget: 2048 },
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            const text = validateOutput(response.text);
            if (text && !text.includes("Content could not be generated")) return JSON.parse(text) as PresentationResult;
        } catch (e2) {
             try {
                const response = await getAi().models.generateContent({
                    model: 'gemini-2.0-flash-exp',
                    contents: prompt,
                    config: {
                        systemInstruction: PENCRAFT_SYSTEM_INSTRUCTION + "\nRole: Expert Presentation Agent.",
                        responseMimeType: "application/json",
                        responseSchema: schema
                    }
                });
                
                const text = validateOutput(response.text);
                if (text && !text.includes("Content could not be generated")) return JSON.parse(text) as PresentationResult;
             } catch (e3) {
                 console.error("Presentation generation failed completely", e3);
             }
        }
    }
    return null;
};