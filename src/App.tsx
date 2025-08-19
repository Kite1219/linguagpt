import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import LanguageSelector from './components/LanguageSelector';
import TranslationInput from './components/TranslationInput';
import TranslationOutput from './components/TranslationOutput';
import HistoryModal from './components/HistoryModal';
import ShortcutsModal from './components/ShortcutsModal';
import NotionModal from './components/NotionModal';
import ToastContainer from './components/ToastContainer';
import TestInterface from './components/TestInterface';
import { translateText } from './services/openai';
import { Language, TranslationResponse } from './types';
import { addToHistory, getHistory, HistoryItem, clearHistory, findCachedTranslation } from './services/history';
import { languages } from './data/languages';
import { getDraftInput, setDraftInput, getDraftTranslation, setDraftTranslation } from './services/draft';
import { getPreferredSourceLanguageCode, getPreferredTargetLanguageCode, setPreferredSourceLanguageCode, setPreferredTargetLanguageCode, getNotionEnabled } from './services/preferences';
import { addToNotion } from './services/notion';
import { ToastProvider, useToast } from './contexts/ToastContext';

function AppContent() {
  const { addToast } = useToast();
  const [inputText, setInputText] = useState(() => getDraftInput());
  const [sourceLanguage, setSourceLanguage] = useState<Language>(() => {
    const stored = getPreferredSourceLanguageCode();
    if (stored) {
      const found = languages.find(l => l.code === stored);
      if (found) return found;
    }
    return languages[0];
  }); // Auto-detect
  const [targetLanguage, setTargetLanguage] = useState<Language>(() => {
    const stored = getPreferredTargetLanguageCode();
    if (stored) {
      const found = languages.find(l => l.code === stored);
      if (found) return found;
    }
    return languages[1];
  }); // English
  const [translation, setTranslation] = useState<TranslationResponse | null>(() => getDraftTranslation());
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [isAddingToNotion, setIsAddingToNotion] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const handler = async (e: KeyboardEvent) => {

      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + H: open history
      if (mod && !e.shiftKey && !e.altKey && (e.key.toLowerCase() === 'h')) {
        e.preventDefault();
        setIsHistoryOpen(true);
        return;
      }

      // Esc: close modals if open, otherwise clear both fields
      if (!e.shiftKey && !e.altKey && !mod && e.key === 'Escape') {
        e.preventDefault();
        if (isHistoryOpen) { setIsHistoryOpen(false); return; }
        if (isShortcutsOpen) { setIsShortcutsOpen(false); return; }
        if (isNotionModalOpen) { setIsNotionModalOpen(false); return; }
        setInputText('');
        setTranslation(null);
        addToast('Input cleared', 'info');
        return;
      }

      // Ctrl/Cmd + L: clear both fields (prevent browser location bar)
      if (mod && !e.shiftKey && !e.altKey && (e.key.toLowerCase() === 'l')) {
        e.preventDefault();
        setInputText('');
        setTranslation(null);
        addToast('Input cleared', 'info');
        return;
      }

      // Ctrl/Cmd + Shift + C: copy translation
      if (mod && e.shiftKey && !e.altKey && (e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        const text = translation?.translatedText;
        if (text) {
          try { 
            await navigator.clipboard.writeText(text); 
            addToast('Copied to clipboard!', 'success');
          } catch {
            addToast('Failed to copy to clipboard', 'error');
          }
        }
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [translation, isHistoryOpen, isShortcutsOpen, isNotionModalOpen, addToast]);

  useEffect(() => {
    setDraftInput(inputText);
  }, [inputText]);

  useEffect(() => {
    setDraftTranslation(translation);
  }, [translation]);

  useEffect(() => {
    setPreferredSourceLanguageCode(sourceLanguage.code);
  }, [sourceLanguage]);

  useEffect(() => {
    setPreferredTargetLanguageCode(targetLanguage.code);
  }, [targetLanguage]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      // Cache lookup first
      const cached = findCachedTranslation(
        inputText,
        sourceLanguage.name,
        targetLanguage.name
      );
      if (cached) {
        setTranslation({
          translatedText: cached.translatedText,
          sourceLanguage: cached.sourceLanguage,
          targetLanguage: cached.targetLanguage,
        });
        setIsLoading(false);
        return;
      }

      const result = await translateText({
        text: inputText,
        sourceLanguage: sourceLanguage.name,
        targetLanguage: targetLanguage.name
      });
      setTranslation(result);
      setHistory(addToHistory({
        inputText,
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
      }));
      addToast('Translation ready', 'success');
    } catch (error) {
      console.error('Translation failed:', error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLanguage.code === 'auto') return; // Can't swap from auto-detect
    
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    setTranslation(null);
  };

  const canTranslate = inputText.trim().length > 0 && !isLoading;
  const canSwap = sourceLanguage.code !== 'auto';

  const handleAddToNotion = async () => {
    if (!inputText.trim()) {
      addToast('No text to add to Notion', 'error');
      return;
    }

    if (!getNotionEnabled()) {
      addToast('Notion integration is not enabled', 'error');
      return;
    }

    setIsAddingToNotion(true);
    try {
      await addToNotion(inputText.trim());
      addToast('Successfully added to Notion!', 'success');
    } catch (error) {
      console.error('Error adding to Notion:', error);
      addToast(error instanceof Error ? error.message : 'Failed to add to Notion', 'error');
    } finally {
      setIsAddingToNotion(false);
    }
  };

	return (
		<div className="min-h-screen bg-dark-bg">
			<Header onOpenCustoms={() => setIsNotionModalOpen(true)} />
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Main Translation Interface */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
					className="space-y-3"
          >
            <LanguageSelector
              selectedLanguage={sourceLanguage}
              onLanguageSelect={setSourceLanguage}
              label="From"
            />
            
            <TranslationInput
              value={inputText}
              onChange={(v) => {
                setInputText(v);
                if (v.trim().length === 0) {
                  setTranslation(null);
                }
              }}
              placeholder="Enter text to translate..."
              onEnter={handleTranslate}
            />
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
					className="space-y-3"
          >
            <LanguageSelector
              selectedLanguage={targetLanguage}
              onLanguageSelect={setTargetLanguage}
              label="To"
              excludeAuto
            />
            
            <TranslationOutput
              translation={translation}
              isLoading={isLoading}
              onClear={() => setTranslation(null)}
              inputText={inputText}
            />
          </motion.div>
        </div>

        {/* Action Buttons */}
				<motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
					className="flex justify-center items-center flex-wrap gap-3 mt-6"
        >
          <button
            onClick={swapLanguages}
            disabled={!canSwap}
            className={`p-3 rounded-xl border transition-all duration-200 ${
              canSwap
                ? 'border-dark-border hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 text-dark-text'
                : 'border-dark-border opacity-50 cursor-not-allowed text-dark-textMuted'
            }`}
            title="Swap languages"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>

          <motion.button
            whileHover={canTranslate ? { scale: 1.02 } : {}}
            whileTap={canTranslate ? { scale: 0.98 } : {}}
            onClick={handleTranslate}
            disabled={!canTranslate}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              canTranslate
                ? 'bg-dark-accent hover:bg-dark-accentHover text-white shadow-lg shadow-dark-accent/25'
                : 'bg-dark-card text-dark-textMuted cursor-not-allowed'
            }`}
            title="Translate (Enter)"
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </motion.button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2 rounded-md border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
            title="Open history (Ctrl/Cmd + H)"
          >
            History
          </button>

          {getNotionEnabled() && (
            <motion.button
              whileHover={inputText.trim() && !isAddingToNotion ? { scale: 1.02 } : {}}
              whileTap={inputText.trim() && !isAddingToNotion ? { scale: 0.98 } : {}}
              type="button"
              onClick={handleAddToNotion}
              disabled={!inputText.trim() || isAddingToNotion}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                inputText.trim() && !isAddingToNotion
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600 hover:border-gray-500 shadow-lg'
                  : 'bg-gray-900 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60'
              }`}
              title="Add input text to Notion"
            >
              <svg 
                className={`w-4 h-4 ${isAddingToNotion ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isAddingToNotion ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                )}
              </svg>
              {isAddingToNotion ? 'Adding...' : 'Add to Notion'}
            </motion.button>
          )}
        </motion.div>

				{/* History Modal */}
				<HistoryModal
					isOpen={isHistoryOpen}
					onClose={() => setIsHistoryOpen(false)}
					history={history}
					onClear={() => { setHistory([]); clearHistory(); }}
					onRestore={(item) => {
						setInputText(item.inputText);
						setTranslation({
							translatedText: item.translatedText,
							sourceLanguage: item.sourceLanguage,
							targetLanguage: item.targetLanguage,
						});
						setIsHistoryOpen(false);
					}}
				/>

				<ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

				<NotionModal isOpen={isNotionModalOpen} onClose={() => setIsNotionModalOpen(false)} />

				{/* Floating help button */}
				<button
					className="fixed bottom-5 right-5 z-40 h-10 w-10 rounded-full border border-dark-border bg-dark-card text-dark-text flex items-center justify-center shadow-lg shadow-black/30 hover:border-dark-accent hover:text-white hover:bg-dark-accent transition-colors"
					onClick={() => setIsShortcutsOpen(true)}
					title="Keyboard shortcuts (?)"
					type="button"
				>
					?
				</button>

				{/* Toast Notifications */}
				<ToastContainer />

				{/* Test Interface (development only) */}
				<TestInterface />

      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
