import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? 'Cmd' : 'Ctrl';

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
            className="bg-dark-card rounded-lg shadow-2xl w-full max-w-lg border border-dark-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div className="text-dark-text font-semibold">Keyboard Shortcuts</div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-sm border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
              >
                Close
              </button>
            </div>

            <div className="p-4">
              <div className="overflow-hidden rounded-md border border-dark-border">
                <table className="w-full text-sm">
                  <thead className="bg-dark-bg/70 text-dark-textMuted">
                    <tr>
                      <th className="text-left font-medium p-3">Action</th>
                      <th className="text-left font-medium p-3">Shortcut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border text-dark-text">
                    <tr>
                      <td className="p-3">Translate text</td>
                      <td className="p-3">Enter</td>
                    </tr>
                    <tr>
                      <td className="p-3">New line</td>
                      <td className="p-3">Shift + Enter</td>
                    </tr>
                    <tr>
                      <td className="p-3">Clear input and output</td>
                      <td className="p-3">{mod} + L</td>
                    </tr>
                    <tr>
                      <td className="p-3">Copy translation</td>
                      <td className="p-3">{mod} + Shift + C</td>
                    </tr>
                    <tr>
                      <td className="p-3">Open history</td>
                      <td className="p-3">{mod} + H</td>
                    </tr>
                    <tr>
                      <td className="p-3">Clear both fields</td>
                      <td className="p-3">Esc</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShortcutsModal;


