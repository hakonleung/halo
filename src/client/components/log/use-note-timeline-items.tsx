'use client';

import { useMemo } from 'react';
import type { TimelineItem } from '@/client/types/timeline';
import { NoteTimelineCard } from '@/client/components/log/note-timeline-card';
import { useNotes } from '@/client/hooks/use-notes';

interface UseNoteTimelineItemsProps {
  timelineStart: Date;
  timelineEnd: Date;
  globalStartDate: string;
  globalEndDate: string;
  noteSearchQuery: string;
  noteTagFilter: string;
  allTags: string[];
  onFilterChange: (key: string, value: string) => void;
  onNoteClick: (noteId: string) => void;
  blockOffset?: number;
}

export function useNoteTimelineItems({
  timelineStart,
  timelineEnd,
  globalStartDate,
  globalEndDate,
  noteSearchQuery,
  noteTagFilter,
  allTags,
  onFilterChange,
  onNoteClick,
  blockOffset = 0,
}: UseNoteTimelineItemsProps): TimelineItem[] {
  const { data: notesData } = useNotes();
  const allNotes = notesData || [];

  const noteTagOptions = useMemo(
    () => [
      { label: 'All Tags', value: 'all' },
      ...allTags.map((tag) => ({ label: `#${tag}`, value: tag })),
    ],
    [allTags],
  );

  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
      if (noteDate < globalStartDate) return false;
      if (noteDate > globalEndDate) return false;

      if (noteSearchQuery) {
        const query = noteSearchQuery.toLowerCase();
        if (
          !note.title?.toLowerCase().includes(query) &&
          !note.content.toLowerCase().includes(query)
        )
          return false;
      }

      if (noteTagFilter && noteTagFilter !== 'all') {
        if (!note.tags || !note.tags.includes(noteTagFilter)) return false;
      }

      return true;
    });
  }, [allNotes, globalStartDate, globalEndDate, noteSearchQuery, noteTagFilter]);

  const items = useMemo<TimelineItem[]>(() => {
    const result: TimelineItem[] = [];

    // Notes items
    filteredNotes.forEach((note) => {
      const noteDate = new Date(note.createdAt);
      const start = noteDate;
      const end = new Date(noteDate.getTime() + 60 * 60 * 1000);

      result.push({
        Renderer: ({ w, h, scrollContainerRef }) => (
          <NoteTimelineCard
            note={note}
            width={w}
            height={h}
            scrollContainerRef={scrollContainerRef}
            onClick={() => onNoteClick(note.id)}
          />
        ),
        h: 60,
        w: 150,
        start,
        end,
        blockOffset,
        type: 'note',
      });
    });

    return result;
  }, [
    filteredNotes,
    timelineStart,
    timelineEnd,
    noteSearchQuery,
    noteTagFilter,
    noteTagOptions,
    onFilterChange,
    onNoteClick,
    blockOffset,
  ]);

  return items;
}
