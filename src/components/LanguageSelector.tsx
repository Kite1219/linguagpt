import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { languages } from '../data/languages';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageSelect: (language: Language) => void;
  label: string;
  excludeAuto?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageSelect,
  label,
  excludeAuto = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = languages
    .filter(lang => excludeAuto ? lang.code !== 'auto' : true)
    .filter(lang => 
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleLanguageSelect = (language: Language) => {
    onLanguageSelect(language);
    setIsModalOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-dark-textMuted">
          {label}
        </label>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-[0.1rem] text-left text-dark-text hover:border-dark-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-opacity-50"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{selectedLanguage.name}</div>
              <div className="text-sm text-dark-textMuted">{selectedLanguage.nativeName}</div>
            </div>
            <svg
              className="w-5 h-5 text-dark-textMuted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-card rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-dark-border">
                <h2 className="text-xl font-semibold text-dark-text mb-4">
                  Select {label}
                </h2>
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-[0.1rem] text-dark-text placeholder-dark-textMuted focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-opacity-50"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className={`w-full px-6 py-3 text-left hover:bg-dark-bg transition-colors duration-150 ${
                      selectedLanguage.code === language.code ? 'bg-dark-accent bg-opacity-10 border-r-2 border-dark-accent' : ''
                    }`}
                  >
                    <div className="font-medium text-dark-text">{language.name}</div>
                    <div className="text-sm text-dark-textMuted">{language.nativeName}</div>
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-dark-border">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-4 py-2 bg-dark-bg hover:bg-opacity-80 border border-dark-border rounded-[0.1rem] text-dark-text transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LanguageSelector;

