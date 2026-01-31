'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUrlQuery } from '@/hooks/use-url-query';
import { DetailDrawerType } from '@/types/drawer';

interface DetailDrawerContextValue {
  drawerType: DetailDrawerType | null;
  drawerId: string | null;
  closeDrawer: () => void;
}

const DetailDrawerContext = createContext<DetailDrawerContextValue | undefined>(undefined);

export function DetailDrawerProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { removeQuery } = useUrlQuery();

  const goalId = searchParams.get('goal');
  const recordId = searchParams.get('record');
  const definitionId = searchParams.get('definition');
  const noteId = searchParams.get('note');

  const drawerType: DetailDrawerType | null = goalId
    ? DetailDrawerType.Goal
    : recordId
      ? DetailDrawerType.Record
      : definitionId
        ? DetailDrawerType.Definition
        : noteId
          ? DetailDrawerType.Note
          : null;

  const drawerId = goalId || recordId || definitionId || noteId || null;

  const closeDrawer = () => {
    if (goalId) removeQuery('goal');
    if (recordId) removeQuery('record');
    if (definitionId) removeQuery('definition');
    if (noteId) removeQuery('note');
  };

  return (
    <DetailDrawerContext.Provider
      value={{
        drawerType,
        drawerId,
        closeDrawer,
      }}
    >
      {children}
    </DetailDrawerContext.Provider>
  );
}

export function useDetailDrawer() {
  const context = useContext(DetailDrawerContext);
  if (context === undefined) {
    throw new Error('useDetailDrawer must be used within DetailDrawerProvider');
  }
  return context;
}
