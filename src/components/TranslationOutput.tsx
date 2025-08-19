import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TranslationResponse, OxfordEntry } from '../types';
import { useToast } from '../contexts/ToastContext';
import { lookupSingleWord } from '../services/oxford';
import DefinitionsModal from './DefinitionsModal';
import { getDictionaryEnabled } from '../services/preferences';

interface TranslationOutputProps {
  translation: TranslationResponse | null;
  isLoading: boolean;
  onClear?: () => void;
  inputText?: string; // Add input text to determine what word to lookup
}

const TranslationOutput: React.FC<TranslationOutputProps> = ({
  translation,
  isLoading,
  onClear,
  inputText
}) => {
  const { addToast } = useToast();
  const [isDefinitionsModalOpen, setIsDefinitionsModalOpen] = useState(false);
  const [oxfordEntry, setOxfordEntry] = useState<OxfordEntry | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupTerm, setLookupTerm] = useState('');
  const [wordHistory, setWordHistory] = useState<string[]>([]); // Navigation history

  const copyToClipboard = async () => {
    if (translation?.translatedText) {
      try {
        await navigator.clipboard.writeText(translation.translatedText);
        addToast('Copied to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        addToast('Failed to copy to clipboard', 'error');
      }
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
      addToast('Output cleared', 'info');
    }
  };

  const handleDictionaryLookup = async () => {
    if (!getDictionaryEnabled()) {
      addToast('Dictionary lookup is disabled. Enable it in Settings.', 'info');
      return;
    }

    if (!inputText) {
      addToast('No input text to lookup', 'error');
      return;
    }

    if (!isEnglishSource()) {
      addToast('Dictionary lookup is only available for English words', 'info');
      return;
    }

    // Use the entire phrase (sanitized), not just the first word
    const phrase = inputText
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/[^a-z\-\s']/gi, '') // keep letters, spaces, hyphen and apostrophe
      .trim();

    if (!phrase) {
      addToast('No valid word found to lookup', 'error');
      return;
    }

    setIsDefinitionsModalOpen(true);
    setWordHistory([]); // Reset history for new lookup
    await lookupWord(phrase, false); // Don't add to history for initial lookup
  };

  const closeDefinitionsModal = () => {
    setIsDefinitionsModalOpen(false);
    setOxfordEntry(null);
    setWordHistory([]);
  };

  // Function to lookup any word (used for both initial and related word lookups)
  const lookupWord = async (word: string, addToHistory: boolean = true) => {
    const sanitizedWord = word
      .trim()
      .toLowerCase()
      .replace(/[^a-z\-\s']/gi, '')
      .trim();

    if (!sanitizedWord) {
      addToast('Invalid word to lookup', 'error');
      return;
    }

    if (addToHistory && lookupTerm) {
      setWordHistory(prev => [...prev, lookupTerm]);
    }

    setLookupTerm(sanitizedWord);
    setIsLookingUp(true);
    
    try {
      const entry = await lookupSingleWord(sanitizedWord);
      setOxfordEntry(entry);
      
      if (!entry) {
        addToast(`No dictionary entry found for "${sanitizedWord}"`, 'info');
      }
    } catch (error) {
      console.error('Dictionary lookup error:', error);
      addToast('Failed to lookup word definition', 'error');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Handle related word clicks
  const handleRelatedWordClick = (word: string) => {
    lookupWord(word, true);
  };

  // Handle back navigation
  const handleGoBack = () => {
    if (wordHistory.length > 0) {
      const previousWord = wordHistory[wordHistory.length - 1];
      setWordHistory(prev => prev.slice(0, -1));
      lookupWord(previousWord, false);
    }
  };

  // Decide if dictionary is available based on language
  const isEnglishSource = () => {
    if (!translation) return false;

    const src = (translation.sourceLanguage || '').toLowerCase();
    const detectedCode = (translation.detectedLanguageCode || '').toLowerCase();
    const detectedName = (translation.detectedLanguageName || '').toLowerCase();

    // If explicit English
    if (src.includes('english') || src === 'en') return true;

    // If auto-detect, rely on detected language fields
    if (src === 'auto-detect' || src === 'detect language' || src === 'auto') {
      if (detectedCode === 'en') return true;
      if (detectedName.includes('english')) return true;
      return false;
    }

    return false;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-dark-textMuted">Translation</label>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            disabled={!translation?.translatedText}
            className={`px-3 py-1.5 rounded-md text-sm border border-dark-border transition-colors duration-200 ${
              translation?.translatedText
                ? 'text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10'
                : 'text-dark-textMuted opacity-50 cursor-not-allowed'
            }`}
            title="Copy to clipboard (Ctrl/Cmd + Shift + C)"
            type="button"
          >
            Copy
          </button>
          {onClear && (
            <button
              onClick={handleClear}
              disabled={!translation}
              className={`px-3 py-1.5 rounded-md text-sm border border-dark-border transition-colors duration-200 ${
                translation
                  ? 'text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10'
                  : 'text-dark-textMuted opacity-50 cursor-not-allowed'
              }`}
              title="Clear output"
              type="button"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-[0.1rem] p-4 relative h-[360px] md:h-[420px]">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-dark-accent border-t-transparent"></div>
                <span className="text-dark-textMuted">Translating...</span>
              </div>
            </motion.div>
          )}

          {!isLoading && !translation && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-full">
              <div className="text-center text-dark-textMuted">
                <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
                </svg>
                <p>Translation will appear here</p>
              </div>
            </motion.div>
          )}

          {!isLoading && translation && (
            <motion.div key="translation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full flex flex-col">
              <div className="text-dark-text leading-relaxed whitespace-pre-wrap flex-1 overflow-auto pr-2 pb-16">{translation.translatedText}</div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="text-xs text-dark-textMuted opacity-30">
                  {translation.sourceLanguage}
                  {translation.detectedLanguageName ? ` (${translation.detectedLanguageName})` : ''} → {translation.targetLanguage}
                </div>

                {/* Dictionary button removed from output; available in input when enabled */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DefinitionsModal 
        isOpen={isDefinitionsModalOpen} 
        onClose={closeDefinitionsModal} 
        entry={oxfordEntry} 
        word={lookupTerm} 
        isLoading={isLookingUp}
        onWordClick={handleRelatedWordClick}
        canGoBack={wordHistory.length > 0}
        onGoBack={handleGoBack}
      />
    </div>
  );
};

export default TranslationOutput;
