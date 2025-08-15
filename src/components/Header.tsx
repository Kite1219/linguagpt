import React from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onOpenShortcuts?: () => void;
  onOpenCustoms?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenShortcuts, onOpenCustoms }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full border-b border-dark-border bg-dark-bg/80 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="grid grid-cols-3 items-center">
          {/* Modern Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.3 }}
            className="relative justify-self-start"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="14" fill="#111" />
              <polygon points="16,7 7,24 25,24" fill="#fff" />
            </svg>
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl md:text-3xl font-bold text-gray-100 justify-self-center"
          >
            LinguaGPT
          </motion.h1>

          {/* Right-side controls */}
          <div className="justify-self-end flex items-center gap-3">
            {onOpenCustoms && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                type="button"
                onClick={onOpenCustoms}
                className="p-2 rounded-md border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
                title="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.button>
            )}
            {onOpenShortcuts && (
              <button
                type="button"
                onClick={onOpenShortcuts}
                className="p-2 rounded-md border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
                title="Keyboard shortcuts (?)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v2m0 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>

      </div>
    </motion.header>
  );
};

export default Header;
