import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OxfordEntry } from '../types';

interface DefinitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: OxfordEntry | null;
  word: string;
  isLoading: boolean;
  onWordClick?: (word: string) => void; // For navigating to related words
  canGoBack?: boolean;
  onGoBack?: () => void;
}

const DefinitionsModal: React.FC<DefinitionsModalProps> = ({
  isOpen,
  onClose,
  entry,
  word,
  isLoading,
  onWordClick,
  canGoBack,
  onGoBack
}) => {
  const handlePronunciation = (wordToSpeak: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const speak = () => {
        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(wordToSpeak);
        
        // Set voice properties for better pronunciation
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Try to find a good English voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        ) || voices.find(voice => 
          voice.lang.startsWith('en')
        );
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
        
        // Speak the word
        window.speechSynthesis.speak(utterance);
      };
      
      // Handle case where voices might not be loaded yet
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Wait for voices to load
        window.speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
      } else {
        speak();
      }
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-dark-card border border-dark-border rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              {/* Navigation buttons */}
              {canGoBack && (
                <button
                  onClick={onGoBack}
                  className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-dark-accent hover:text-dark-accentHover"
                  title="Go back to previous word"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              <div>
                <h2 className="text-xl font-semibold text-dark-text">
                  Dictionary: "{word}"
                </h2>
                {entry && (
                  <div className="flex items-center gap-3 mt-2 text-dark-textMuted">
                    {entry.pos && (
                      <span className="px-2 py-1 bg-dark-accent bg-opacity-20 text-dark-accent rounded text-sm">
                        {entry.pos}
                      </span>
                    )}
                    {entry.phon && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-dark-textMuted">
                          /{entry.phon}/
                        </span>
                        <button
                          onClick={() => handlePronunciation(entry.head)}
                          className="p-1.5 rounded-full hover:bg-dark-accent hover:bg-opacity-20 transition-all duration-200 text-dark-accent hover:text-dark-accentHover hover:scale-110 active:scale-95"
                          title={`🔊 Listen to pronunciation of "${entry.head}"`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-dark-textMuted hover:text-dark-text"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] grid grid-cols-1 lg:grid-cols-[minmax(560px,1fr)_320px] gap-10">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-dark-accent border-t-transparent"></div>
                  <span className="text-dark-textMuted">Looking up word...</span>
                </div>
              </div>
            )}

            {!isLoading && !entry && (
              <div className="text-center py-8">
                <div className="text-dark-textMuted">
                  <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.563M15 9.34c0-1.8-.91-3.34-2.34-3.34s-2.34 1.54-2.34 3.34c0 .48.07.94.19 1.37" />
                  </svg>
                  <p className="text-lg">No definition found</p>
                  <p className="text-sm mt-1">This word might not be available in the Oxford Dictionary or there might be a spelling error.</p>
                </div>
              </div>
            )}

            {!isLoading && entry && (
              <>
              {/* Left column: main content */}
              <div className="space-y-6 min-w-0">
                {/* Main word info */}
                <div>
                  <h3 className="text-3xl font-bold text-dark-text mb-2">
                    {entry.head}
                  </h3>
                  
                  {entry.extra && entry.extra.length > 0 && (
                    <div className="text-sm text-dark-textMuted mb-3">
                      {entry.extra.map((extra, index) => (
                        <span key={index} className="mr-2">
                          ({extra})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Definitions */}
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-dark-text">Definitions</h4>
                  {entry.senses.map((sense, index) => (
                    <div key={index} className="border-l-2 border-dark-accent border-opacity-30 pl-4">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-dark-accent font-semibold text-sm mt-1">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="text-dark-text leading-relaxed">
                            {sense.definition}
                          </p>
                          
                          {sense.label && (
                            <span className="inline-block mt-1 px-2 py-1 bg-dark-bg text-sm text-dark-textMuted rounded">
                              {sense.label}
                            </span>
                          )}
                          
                          {sense.synonym && (
                            <div className="mt-2 text-sm text-dark-textMuted">
                              <strong>Synonym:</strong> {sense.synonym}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Examples */}
                      {sense.examples && sense.examples.length > 0 && (
                        <div className="mt-3 ml-6">
                          <h5 className="text-sm font-medium text-dark-textMuted mb-2">Examples:</h5>
                          <ul className="space-y-1">
                            {sense.examples.map((example, exIndex) => (
                              <li key={exIndex} className="text-sm text-dark-textMuted italic">
                                "{example}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Oxford link */}
                {entry.url && (
                  <div className="pt-4 border-t border-dark-border">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-dark-accent hover:text-dark-accentHover transition-colors inline-flex items-center gap-1"
                    >
                      View on Oxford Learner's Dictionary
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Right column: related sections */}
              <aside className="space-y-6">
                {entry.relatedSections && entry.relatedSections.length > 0 && (
                  entry.relatedSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h5 className="text-sm font-semibold text-dark-text mb-2 opacity-80">
                        {section.title}
                      </h5>
                      <div className="flex flex-col gap-1">
                        {section.words.map((relatedWord, wordIndex) => (
                          <button
                            key={wordIndex}
                            onClick={() => onWordClick?.(relatedWord.word)}
                            className="text-left px-3 py-2 rounded-md hover:bg-dark-accent hover:bg-opacity-10 transition-colors group"
                            title={`Look up "${relatedWord.word}"`}
                          >
                            <span className="text-dark-text group-hover:text-dark-accent font-medium mr-2 text-[15px]">
                              {relatedWord.word}
                            </span>
                            {relatedWord.type && relatedWord.type !== 'word' && relatedWord.type !== 'related' && (
                              <span className="text-xs text-dark-textMuted opacity-70 align-middle">
                                {relatedWord.type}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </aside>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DefinitionsModal;
