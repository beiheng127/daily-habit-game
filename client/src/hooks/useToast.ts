import { useState, useCallback } from 'react';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export const useToast = () => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return { toast, showToast };
};
