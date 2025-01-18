import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import mixpanel from 'mixpanel-browser';
import { ENABLE_ANALYTICS } from '../../config/api-config';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language.code);
    setIsOpen(false);

    if (ENABLE_ANALYTICS) {
      mixpanel.track('Language Changed', {
        from: selectedLanguage,
        to: language.code,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 md:p-2 text-perplexity-muted hover:text-perplexity-text hover:bg-perplexity-hover rounded-lg transition-colors flex items-center gap-1"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs">{selectedLang.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-48 bg-perplexity-card rounded-lg shadow-lg border border-perplexity-hover py-1 z-50">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className={cn(
                "w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-perplexity-hover transition-colors",
                language.code === selectedLanguage ? "text-perplexity-accent" : "text-perplexity-text"
              )}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 