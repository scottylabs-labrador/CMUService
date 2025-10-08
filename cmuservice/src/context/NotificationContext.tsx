// src/context/NotificationContext.tsx

'use client';

import { InfoDialog } from "@/components/ui/InfoDialog";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationMessage = {
  title: string;
  description: string;
};

interface NotificationContextType {
  showNotification: (message: NotificationMessage) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationMessage | null>(null);

  const showNotification = (message: NotificationMessage) => {
    setNotification(message);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <InfoDialog
          isOpen={!!notification}
          onClose={closeNotification}
          title={notification.title}
          description={notification.description}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}