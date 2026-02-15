
import { Platform } from '../types';
import { PLATFORM_CONFIG } from '../constants';

export interface AutomationPayload {
  platform: Platform;
  text: string;
  imageBlob?: Blob;
  targetUrl: string;
}

export type AutomationStatus = 'idle' | 'running' | 'success' | 'manual_fallback' | 'error';

/**
 * AUTOMATION LAYER (The "Hands")
 * 
 * This service acts as the bridge to the Browser Extension (PenCraft Agent).
 * 
 * FALLBACK STRATEGY (When Extension is missing):
 * 1. Image -> System Clipboard (User manually pastes via Ctrl+V).
 * 2. Text -> URL Intent parameters (where supported).
 * 3. Browser -> Opens Target URL.
 */
class AutomationService {
  
  /**
   * Triggers the Auto-Publish sequence.
   */
  async publish(
    platform: Platform, 
    text: string, 
    imageUrl?: string,
    onStatusChange?: (status: string) => void
  ): Promise<AutomationStatus> {
    
    try {
      const config = PLATFORM_CONFIG[platform];
      let imageBlob: Blob | undefined;

      // STEP 1: PREPARE ASSETS (Memory Only)
      if (imageUrl) {
        onStatusChange?.("Buffering visual asset into memory...");
        try {
          const response = await fetch(imageUrl);
          imageBlob = await response.blob();
        } catch (e) {
          console.error("Failed to load image blob", e);
        }
      }

      const payload: AutomationPayload = {
        platform,
        text,
        imageBlob,
        targetUrl: config.url
      };

      // STEP 2: ATTEMPT EXTENSION HANDSHAKE
      onStatusChange?.("Pinging PenCraft Agent...");
      const extensionDetected = await this.detectExtension();

      if (extensionDetected) {
        // HAPPY PATH: Extension exists. Dispatch payload.
        onStatusChange?.("Agent connected. Dispatching payload...");
        this.dispatchToExtension(payload);
        
        // We assume success once dispatched, the extension takes over UI.
        await new Promise(r => setTimeout(r, 1000)); 
        return 'success';
      } else {
        // FALLBACK PATH: No Extension.
        // We inject the image to clipboard so the user can paste it.
        onStatusChange?.("Agent not found. Switching to Clipboard Fallback...");
        await this.executeFallback(payload, onStatusChange);
        return 'manual_fallback';
      }

    } catch (error) {
      console.error("Automation Failed:", error);
      return 'error';
    }
  }

  /**
   * Checks for the presence of the PenCraft Browser Extension.
   */
  private detectExtension(): Promise<boolean> {
    return new Promise((resolve) => {
      // 1. Check for global flag injected by content script
      if ((window as any).__PENCRAFT_AGENT_ACTIVE__) {
        return resolve(true);
      }

      // 2. Listen for a pong event (if logic requires async handshake)
      const handlePong = () => {
        window.removeEventListener('PENCRAFT_PONG', handlePong);
        resolve(true);
      };
      window.addEventListener('PENCRAFT_PONG', handlePong);
      
      // Dispatch Ping
      window.dispatchEvent(new CustomEvent('PENCRAFT_PING'));

      // Timeout
      setTimeout(() => {
        window.removeEventListener('PENCRAFT_PONG', handlePong);
        resolve(false);
      }, 500);
    });
  }

  /**
   * Dispatches the event to the browser extension content script.
   */
  private dispatchToExtension(payload: AutomationPayload) {
    const event = new CustomEvent('PENCRAFT_EXECUTE', { detail: payload });
    window.dispatchEvent(event);
  }

  /**
   * EXECUTES THE FALLBACK (When no extension is present)
   * 
   * Strategy:
   * 1. Image -> System Clipboard (Silent).
   * 2. Text -> URL Intent (where supported).
   * 3. Browser -> Opens Target URL.
   */
  private async executeFallback(payload: AutomationPayload, onStatusChange?: (status: string) => void) {
    
    // 1. Handle Image (Priority: Clipboard)
    if (payload.imageBlob) {
      onStatusChange?.("Injecting image to System Clipboard...");
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [payload.imageBlob.type]: payload.imageBlob
          })
        ]);
        onStatusChange?.("Image copied. Ready to paste (Ctrl+V).");
      } catch (e) {
        console.warn("Clipboard injection failed", e);
        onStatusChange?.("Clipboard access denied. Manual upload required.");
      }
    }

    // 2. Construct Deep Link Intent for Text
    onStatusChange?.("Constructing deep link intent...");
    let finalUrl = payload.targetUrl;
    
    // LinkedIn, Twitter, Reddit support text params via URL
    if (payload.platform === 'LinkedIn') {
        finalUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(payload.text)}`;
    } else if (payload.platform === 'X (Twitter)') {
        finalUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(payload.text)}`;
    } else if (payload.platform === 'Reddit') {
        finalUrl = `https://www.reddit.com/submit?selftext=true&text=${encodeURIComponent(payload.text)}`;
    } else if (payload.platform === 'Threads') {
        finalUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(payload.text)}`;
    }

    // 3. Launch
    onStatusChange?.("Opening platform composer...");
    await new Promise(r => setTimeout(r, 800));
    window.open(finalUrl, '_blank');
  }
}

export const automationService = new AutomationService();