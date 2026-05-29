import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastData {
  message: string;
  type: 'success' | 'error';
}

interface Props {
  toast: ToastData | null;
}

const Toast: React.FC<Props> = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl shadow-lg text-white z-50 text-sm font-medium ${
            toast.type === 'success' ? 'bg-accent-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
