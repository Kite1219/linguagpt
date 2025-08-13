import React from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';

interface TranslationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  onEnter?: () => void;
}

const TranslationInput: React.FC<TranslationInputProps> = ({
  value,
  onChange,
  placeholder = "Enter text to translate...",
  maxLength = 5000,
  onEnter
}) => {
  const { addToast } = useToast();

  const handleClear = () => {
    onChange('');
    addToast('Input cleared', 'info');
  };
  return (
         <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="space-y-2"
     >
       <div className="flex items-center justify-between">
         <label className="block text-sm font-medium text-dark-textMuted">
           Text to translate
         </label>
         <div className="flex items-center gap-2">
           <button
             onClick={async () => {
               try {
                 const text = await navigator.clipboard.readText();
                 onChange(text);
               } catch (err) {
                 console.error('Failed to paste from clipboard:', err);
               }
             }}
             className="px-3 py-1.5 rounded-md text-sm border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
              title="Paste from clipboard"
             type="button"
           >
             Paste
           </button>
           <button
             onClick={handleClear}
             className="px-3 py-1.5 rounded-md text-sm border border-dark-border text-dark-textMuted hover:text-dark-text hover:border-dark-accent hover:bg-dark-accent hover:bg-opacity-10 transition-colors duration-200"
              title="Clear input"
             type="button"
           >
             Clear
           </button>
         </div>
       </div>
       <div className="relative">
         <textarea
           value={value}
           onChange={(e) => onChange(e.target.value)}
           placeholder={placeholder}
           maxLength={maxLength}
           onKeyDown={(e) => {
             if (
               e.key === 'Enter' &&
               !e.shiftKey &&
               !e.altKey &&
               !e.ctrlKey &&
               !(e as any).nativeEvent?.isComposing
             ) {
               e.preventDefault();
               onEnter?.();
             }
           }}
           className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-[0.1rem] text-dark-text placeholder-dark-textMuted resize-none focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-opacity-50 focus:border-transparent transition-all duration-200 h-[360px] md:h-[420px]"
            title="Enter to translate, Shift+Enter for new line"
         />
         <div className="absolute bottom-3 right-3 text-xs text-dark-textMuted opacity-30">
           {value.length}/{maxLength}
         </div>
       </div>
     </motion.div>
  );
};

export default TranslationInput;

