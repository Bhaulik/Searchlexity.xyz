import { Dialog } from '@headlessui/react';
import { ChatInput } from './chat/chat-input';
import { useSearchStore } from '../store/search-store';

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

interface NewThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, language: string) => void;
}

export function NewThreadDialog({ isOpen, onClose, onSubmit }: NewThreadDialogProps) {
  const selectedLanguage = useSearchStore(state => state.selectedLanguage);
  const setSelectedLanguage = useSearchStore(state => state.setSelectedLanguage);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-perplexity-bg p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium mb-4">
            Start a New Thread
          </Dialog.Title>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full rounded-lg bg-perplexity-card border border-perplexity-card p-2 text-perplexity-text"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <ChatInput
            onSubmit={(content) => {
              onSubmit(content, selectedLanguage);
              onClose();
            }}
            isNewThread
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}