'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  updateMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
  updateMessage: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export default function LoadingProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('Loading...');

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg || 'Loading...');
    setIsVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsVisible(false);
  }, []);

  // ✅ TIDAK bergantung pada isVisible – langsung set pesan
  const updateMessage = useCallback((newMsg: string) => {
    setMessage(newMsg);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, updateMessage }}>
      {children}
      {isVisible && (
        <div className="loading-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="loading-box">
            <div className="spinner"></div>
            <p className="loading-text">{message}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}