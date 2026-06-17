import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4"
        >
          <div className={`
            flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-md
            ${type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : ''}
            ${type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' : ''}
            ${type === 'info' ? 'bg-slate-800/90 border-slate-700 text-white' : ''}
          `}>
            <div className="flex-shrink-0">
              {type === 'success' && <CheckCircle2 size={18} />}
              {type === 'error' && <AlertCircle size={18} />}
              {type === 'info' && <CheckCircle2 size={18} />}
            </div>

            <p className="flex-1 text-xs font-mono font-bold leading-tight">
              {message}
            </p>

            <button
              onClick={onClose}
              className="flex-shrink-0 hover:bg-white/10 p-1 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
