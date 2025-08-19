import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { lookupSingleWord } from '../services/oxford';
import DefinitionsModal from './DefinitionsModal';
import { getDictionaryEnabled } from '../services/preferences';
import { OxfordEntry } from '../types';

interface TranslationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  onEnter?: () => void;
}

const TranslationInput: React.FC<TranslationInputProps> = ({
  value,
  onChange,
  placeholder = "Enter text to translate...",
  maxLength = 5000,
  onEnter
}) => {
  const { addToast } = useToast();
  const [isDefinitionsModalOpen, setIsDefinitionsModalOpen] = useState(false);
  const [oxfordEntry, setOxfordEntry] = useState<OxfordEntry | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupTerm, setLookupTerm] = useState('');
  const [wordHistory, setWordHistory] = useState<string[]>([]);

  const handleClear = () => {
    onChange('');
    addToast('Input cleared', 'info');
  };

  const closeDefinitionsModal = () => {
    setIsDefinitionsModalOpen(false);
    setOxfordEntry(null);
    setWordHistory([]);
  };

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

  const handleRelatedWordClick = (word: string) => {
    lookupWord(word, true);
  };

  const handleGoBack = () => {
    if (wordHistory.length > 0) {
      const previousWord = wordHistory[wordHistory.length - 1];
      setWordHistory(prev => prev.slice(0, -1));
      lookupWord(previousWord, false);
    }
  };

  const handleDictionaryLookup = async () => {
    if (!getDictionaryEnabled()) {
      addToast('Dictionary lookup is disabled. Enable it in Settings.', 'info');
      return;
    }

    const phrase = value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/[^a-z\-\s']/gi, '')
      .trim();

    if (!phrase) {
      addToast('No valid word found to lookup', 'error');
      return;
    }

    setIsDefinitionsModalOpen(true);
    setWordHistory([]);
    await lookupWord(phrase, false);
  };
  return (
         <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="space-y-2"
     >
       <div className="flex items-center justify-between">
         <label className="block text-sm font-medium text-dark-textMuted">
           Text to translate
         </label>
         <div className="flex items-center gap-2">
           <button
             onClick={async () => {
               try {
                 const text = await navigator.clipboard.readText();
                 onChange(text);
               } catch (err) {
                 console.error('Failed to paste from clipboard:', err);
               }
             }}
             className="px-3 py-1.5 rounded-md text-sm border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
              title="Paste from clipboard"
             type="button"
           >
             Paste
           </button>
           <button
             onClick={handleClear}
             className="px-3 py-1.5 rounded-md text-sm border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
              title="Clear input"
             type="button"
           >
             Clear
           </button>
           {getDictionaryEnabled() && (
             <button
               onClick={handleDictionaryLookup}
               disabled={isLookingUp || !value.trim()}
               className={`px-3 py-1.5 rounded-md text-sm border transition-colors duration-200 flex items-center gap-1 ${
                 value.trim()
                   ? 'border-dark-border text-dark-accent hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10'
                   : 'border-dark-border text-dark-textMuted opacity-50 cursor-not-allowed'
               }`}
                title="Look up definitions in Oxford Dictionary"
               type="button"
             >
               {isLookingUp ? (
                 <>
                   <div className="animate-spin rounded-full h-3 w-3 border border-dark-accent border-t-transparent"></div>
                   Looking up...
                 </>
               ) : (
                 <>
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                   </svg>
                   Dictionary
                 </>
               )}
             </button>
           )}
         </div>
       </div>
       <div className="relative">
         <textarea
           value={value}
           onChange={(e) => onChange(e.target.value)}
           placeholder={placeholder}
           maxLength={maxLength}
           onKeyDown={(e) => {
             if (
               e.key === 'Enter' &&
               !e.shiftKey &&
               !e.altKey &&
               !e.ctrlKey &&
               !(e as any).nativeEvent?.isComposing
             ) {
               e.preventDefault();
               onEnter?.();
             }
           }}
           className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-[0.1rem] text-dark-text placeholder-dark-textMuted resize-none focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-opacity-50 focus:border-transparent transition-all duration-200 h-[360px] md:h-[420px]"
            title="Enter to translate, Shift+Enter for new line"
         />
         <div className="absolute bottom-3 right-3 text-xs text-dark-textMuted opacity-30">
           {value.length}/{maxLength}
         </div>
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
     </motion.div>
  );
};

export default TranslationInput;

