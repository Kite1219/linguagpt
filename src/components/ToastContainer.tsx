import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 space-y-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              // Slight stacking effect for multiple toasts
              transform: `translateY(${index * -2}px)`,
            }}
            exit={{ 
              opacity: 0, 
              y: 20, 
              scale: 0.95,
              transition: { duration: 0.2 }
            }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              layout: { duration: 0.2 }
            }}
            style={{
              zIndex: 50 - index, // Higher z-index for newer toasts
            }}
          >
            <Toast
              toast={toast}
              onRemove={removeToast}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
