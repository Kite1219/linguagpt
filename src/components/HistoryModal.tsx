import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HistoryItem } from '../services/history';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onRestore, onClear }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-dark-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-dark-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div className="text-dark-text font-semibold">History</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClear}
                  className="px-3 py-1.5 rounded-md text-sm border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md text-sm border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center text-dark-textMuted py-12">No history yet</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => onRestore(item)}
                      className="text-left bg-dark-bg hover:bg-opacity-80 border border-dark-border rounded-md p-3 transition-colors duration-200"
                      title="Click to restore"
                    >
                      <div className="text-xs text-dark-textMuted mb-1">
                        {item.sourceLanguage} → {item.targetLanguage}
                      </div>
                      <div className="text-sm line-clamp-3 text-dark-text">
                        {item.translatedText}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HistoryModal;


