'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// ---------- TIPE DATA ----------
export interface ModalButton {
  label: string;
  variant?: 'primary' | 'danger' | 'outline'; // sesuai class .btn-{variant}
  onClick: () => void | Promise<void>;
}

interface ModalOptions {
  title?: string;
  message: ReactNode;        // bisa string atau JSX
  buttons?: ModalButton[];
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

// ---------- CONTEXT ----------
const ModalContext = createContext<ModalContextType>({
  showModal: () => {},
  closeModal: () => {},
});

export const useModal = () => useContext(ModalContext);

// ---------- PROVIDER ----------
export default function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalOptions | null>(null);

  const showModal = useCallback((options: ModalOptions) => {
    setModalContent(options);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
  }, []);

  // Tombol default jika tidak disediakan
  const defaultButtons: ModalButton[] = [
    { label: 'OK', variant: 'primary', onClick: closeModal },
  ];

  const buttons =
    modalContent?.buttons && modalContent.buttons.length > 0
      ? modalContent.buttons
      : defaultButtons;

  const handleButtonClick = async (button: ModalButton) => {
    await button.onClick();
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}

      {/* Modal */}
      {isOpen && modalContent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {modalContent.title && (
              <div className="modal-header">
                <h3>{modalContent.title}</h3>
                <button
                  className="modal-close-btn"
                  onClick={closeModal}
                  aria-label="Tutup"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            {/* Body */}
            <div className="modal-body">{modalContent.message}</div>

            {/* Footer dengan tombol */}
            <div className="modal-footer">
              {buttons.map((btn, idx) => (
                <button
                  key={idx}
                  className={`btn btn-${btn.variant || 'outline'}`}
                  onClick={() => handleButtonClick(btn)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}