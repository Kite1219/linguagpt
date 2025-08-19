import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { lookupSingleWord } from '../services/oxford';
import { OxfordEntry } from '../types';
import DefinitionsModal from './DefinitionsModal';
import { useToast } from '../contexts/ToastContext';

// This component is for development testing only
const TestInterface: React.FC = () => {
  const [testWord, setTestWord] = useState('hello');
  const [isLoading, setIsLoading] = useState(false);
  const [entry, setEntry] = useState<OxfordEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const handleTest = async () => {
    if (!testWord.trim()) return;

    setIsLoading(true);
    try {
      const result = await lookupSingleWord(testWord.trim());
      setEntry(result);
      setIsModalOpen(true);
      
      if (!result) {
        addToast(`No definition found for "${testWord}"`, 'info');
      } else {
        addToast('Dictionary lookup successful!', 'success');
      }
    } catch (error) {
      console.error('Test lookup error:', error);
      addToast('Failed to lookup word', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 right-5 bg-dark-card border border-dark-border rounded-lg p-4 shadow-xl z-40"
    >
      <div className="text-sm text-dark-text mb-3 font-semibold">
        🧪 Oxford Dictionary Test
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={testWord}
          onChange={(e) => setTestWord(e.target.value)}
          placeholder="Enter word to test..."
          className="px-3 py-2 bg-dark-bg border border-dark-border rounded text-sm text-dark-text placeholder-dark-textMuted focus:border-dark-accent focus:outline-none"
          onKeyPress={(e) => e.key === 'Enter' && handleTest()}
        />
        <button
          onClick={handleTest}
          disabled={!testWord.trim() || isLoading}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            testWord.trim() && !isLoading
              ? 'bg-dark-accent hover:bg-dark-accentHover text-white'
              : 'bg-dark-bg text-dark-textMuted cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Testing...' : 'Test'}
        </button>
      </div>

      <div className="text-xs text-dark-textMuted">
        This tests the Oxford Dictionary lookup functionality.
        <br />
        <strong>Try any English word</strong> - fetches real data from Oxford Dictionary
        <br />
        <span className="text-dark-accent">Requires Netlify deployment to work</span>
      </div>

      <DefinitionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={entry}
        word={testWord}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default TestInterface;
