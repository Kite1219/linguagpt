import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TranslationResponse } from '../types';
import { useToast } from '../contexts/ToastContext';

interface TranslationOutputProps {
  translation: TranslationResponse | null;
  isLoading: boolean;
  onClear?: () => void;
}

const TranslationOutput: React.FC<TranslationOutputProps> = ({
  translation,
  isLoading,
  onClear
}) => {
  const { addToast } = useToast();

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-dark-textMuted">
          Translation
        </label>
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
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-dark-accent border-t-transparent"></div>
                <span className="text-dark-textMuted">Translating...</span>
              </div>
            </motion.div>
          )}

          {!isLoading && !translation && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center text-dark-textMuted">
                <svg
                  className="mx-auto h-12 w-12 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"
                  />
                </svg>
                <p>Translation will appear here</p>
              </div>
            </motion.div>
          )}

          {!isLoading && translation && (
            <motion.div
              key="translation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              <div className="text-dark-text leading-relaxed whitespace-pre-wrap flex-1 overflow-auto pr-2 pb-8">
                {translation.translatedText}
              </div>
              
              <div className="absolute bottom-3 right-3 text-xs text-dark-textMuted opacity-30">
                {translation.sourceLanguage} → {translation.targetLanguage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TranslationOutput;
