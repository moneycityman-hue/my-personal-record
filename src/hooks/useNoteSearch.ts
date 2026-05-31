"use client";

import { useMemo } from "react";
import type { Note } from "@/types/note";

export function useNoteSearch(notes: Note[], query: string) {
  return useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();

    if (!normalized) {
      return notes;
    }

    return notes.filter((note) => {
      const todoText = note.todos.map((todo) => todo.text).join(" ");
      return `${note.title} ${note.content} ${todoText}`.toLocaleLowerCase().includes(normalized);
    });
  }, [notes, query]);
}
