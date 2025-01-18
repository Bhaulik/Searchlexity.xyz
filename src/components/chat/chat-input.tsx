import { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Paperclip, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSearchStore } from '../../store/search-store';
import mixpanel from 'mixpanel-browser';
import { ENABLE_ANALYTICS } from '../../config/api-config';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
];

interface ChatInputProps {
  onSubmit: (content: string, language: string) => void;
  disabled?: boolean;
  isFollowUp?: boolean;
  onStop?: () => void;
  isNewThread?: boolean;
}

export function ChatInput({
  onSubmit,
  disabled = false,
  isFollowUp = false,
  onStop,
  isNewThread = false
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  
  const selectedLanguage = useSearchStore(state => state.selectedLanguage);
  const setSelectedLanguage = useSearchStore(state => state.setSelectedLanguage);
  const isProMode = useSearchStore(state => state.isProMode);
  const toggleProMode = useSearchStore(state => state.toggleProMode);

  useEffect(() => {
    if (isNewThread && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isNewThread]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim(), selectedLanguage);
      setInput('');
    }
  };

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    setShowLanguageMenu(false);
    if (ENABLE_ANALYTICS) {
      mixpanel.track('Language Changed', {
        from: selectedLanguage,
        to: code,
        timestamp: new Date().toISOString()
      });
    }
  };

  const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isFollowUp ? "Ask a follow-up question..." : "Ask anything..."}
        className={cn(
          "w-full bg-perplexity-card rounded-lg pl-4 pr-36 py-3 outline-none text-perplexity-text",
          "placeholder:text-perplexity-muted",
          "focus:ring-2 focus:ring-perplexity-accent/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
      />
      
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {disabled && onStop && (
          <button
            type="button"
            onClick={onStop}
            className="p-2 text-perplexity-accent hover:text-perplexity-accent/80 transition-colors"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        )}

        {/* Language Selector */}
        <div className="relative" ref={languageMenuRef}>
          <button
            type="button"
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="p-2 text-perplexity-muted hover:text-perplexity-text transition-colors"
          >
            <span className="flex items-center gap-1">
              <span className="text-sm">{selectedLang?.flag}</span>
              <Globe className="w-4 h-4" />
            </span>
          </button>
          
          {showLanguageMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-perplexity-bg rounded-lg shadow-xl border border-perplexity-card py-1 z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-perplexity-card transition-colors",
                    lang.code === selectedLanguage ? "text-perplexity-accent" : "text-perplexity-text"
                  )}
                >
                  <span>{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attachment Button */}
        <button
          type="button"
          className="p-2 text-perplexity-muted hover:text-perplexity-text transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Pro Mode Toggle */}
        <div className="hidden md:flex items-center gap-1">
          <button
            type="button"
            onClick={toggleProMode}
            className="relative w-8 h-4 rounded-full transition-colors"
            style={{ backgroundColor: isProMode ? 'rgb(var(--perplexity-accent))' : 'rgb(var(--perplexity-card))' }}
          >
            <div
              className={cn(
                "absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200",
                isProMode ? "right-0.5 bg-white" : "left-0.5 bg-perplexity-muted"
              )}
            />
          </button>
          <span className={cn(
            "text-sm transition-colors",
            isProMode ? "text-perplexity-accent" : "text-perplexity-muted"
          )}>Pro</span>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={cn(
            "p-2 text-perplexity-accent hover:text-perplexity-accent/80 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}