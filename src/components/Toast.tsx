import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast as ToastType } from '../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleRemove = () => {
    setIsVisible(false);
    // Wait for exit animation before removing from DOM
    setTimeout(() => onRemove(toast.id), 200);
  };

  // Auto-dismiss timer visual feedback
  const [timeLeft, setTimeLeft] = useState(100);
  
  useEffect(() => {
    if (!toast.duration) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newValue = prev - (100 / (toast.duration! / 50));
        return newValue > 0 ? newValue : 0;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-400/20';
      case 'error':
        return 'border-red-400/20';
      case 'info':
      default:
        return 'border-blue-400/20';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`relative bg-dark-card border ${getBorderColor()} rounded-lg p-4 shadow-xl shadow-black/30 min-w-[300px] max-w-[400px]`}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-dark-accent rounded-bl-lg transition-all duration-50 ease-linear"
               style={{ width: `${timeLeft}%` }} />
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-dark-text text-sm font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>
            
            <button
              onClick={handleRemove}
              className="flex-shrink-0 text-dark-textMuted hover:text-dark-text transition-colors duration-200 p-1 -m-1 rounded-md hover:bg-dark-border/20"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
