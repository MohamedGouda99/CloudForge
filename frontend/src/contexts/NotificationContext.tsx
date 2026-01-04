import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'apply' | 'destroy';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showActions?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

interface NotificationContextType {
  showNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    options?: {
      autoClose?: boolean;
      autoCloseDelay?: number;
      showActions?: boolean;
      onConfirm?: () => void;
      onClose?: () => void;
    }
  ) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  const showNotification = useCallback(
    (
      title: string,
      message: string,
      type: NotificationType = 'info',
      options?: {
        autoClose?: boolean;
        autoCloseDelay?: number;
        showActions?: boolean;
        onConfirm?: () => void;
        onClose?: () => void;
      }
    ) => {
      const notification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        autoClose: options?.autoClose ?? true,
        autoCloseDelay: options?.autoCloseDelay ?? 5000,
        showActions: options?.showActions ?? false,
        onConfirm: options?.onConfirm,
        onClose: options?.onClose,
      };

      setCurrentNotification(notification);
      setNotifications(prev => [...prev, notification]);
    },
    []
  );

  const showError = useCallback(
    (message: string, title: string = 'Error') => {
      showNotification(title, message, 'error', { autoClose: true, autoCloseDelay: 7000 });
    },
    [showNotification]
  );

  const showSuccess = useCallback(
    (message: string, title: string = 'Success') => {
      showNotification(title, message, 'success', { autoClose: true, autoCloseDelay: 4000 });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title: string = 'Warning') => {
      showNotification(title, message, 'warning', { autoClose: true, autoCloseDelay: 6000 });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title: string = 'Info') => {
      showNotification(title, message, 'info', { autoClose: true, autoCloseDelay: 5000 });
    },
    [showNotification]
  );

  const handleClose = useCallback(() => {
    if (currentNotification?.onClose) {
      currentNotification.onClose();
    }
    setCurrentNotification(null);
  }, [currentNotification]);

  const handleConfirm = useCallback(() => {
    if (currentNotification?.onConfirm) {
      currentNotification.onConfirm();
    }
    setCurrentNotification(null);
  }, [currentNotification]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showError,
        showSuccess,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {currentNotification && (
        <ConfirmationModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={currentNotification.title}
          message={currentNotification.message}
          actionType={currentNotification.type as any}
          autoClose={currentNotification.autoClose}
          autoCloseDelay={currentNotification.autoCloseDelay}
          showActions={currentNotification.showActions}
          confirmText="OK"
          cancelText="Dismiss"
        />
      )}
    </NotificationContext.Provider>
  );
};