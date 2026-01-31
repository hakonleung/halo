'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { ActionDrawerTab } from '@/types/drawer';

interface ActionDrawerContextValue {
  isOpen: boolean;
  activeTab: ActionDrawerTab;
  openDrawer: (tab?: ActionDrawerTab) => void;
  closeDrawer: () => void;
  setActiveTab: (tab: ActionDrawerTab) => void;
}

const ActionDrawerContext = createContext<ActionDrawerContextValue | undefined>(undefined);

export function ActionDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActionDrawerTab>(ActionDrawerTab.Record);

  const openDrawer = (tab?: ActionDrawerTab) => {
    if (tab) {
      setActiveTab(tab);
    }
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return (
    <ActionDrawerContext.Provider
      value={{
        isOpen,
        activeTab,
        openDrawer,
        closeDrawer,
        setActiveTab,
      }}
    >
      {children}
    </ActionDrawerContext.Provider>
  );
}

export function useActionDrawer() {
  const context = useContext(ActionDrawerContext);
  if (context === undefined) {
    throw new Error('useActionDrawer must be used within ActionDrawerProvider');
  }
  return context;
}
