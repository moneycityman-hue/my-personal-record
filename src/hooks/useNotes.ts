"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { NOTE_SELECT } from "@/lib/db-selects";
import { createClient } from "@/lib/supabase/client";
import type { Note, NoteInput, NoteStatusFilter, TodoItem } from "@/types/note";

const statusFilters: NoteStatusFilter[] = ["active", "completed"];

function sanitizeTodos(value: unknown): TodoItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is TodoItem => {
      return (
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "text" in item &&
        "completed" in item
      );
    })
    .map((item) => ({
      id: String(item.id),
      text: String(item.text),
      completed: Boolean(item.completed)
    }));
}

function toNote(note: Note): Note {
  return {
    ...note,
    is_completed: Boolean(note.is_completed),
    todos: sanitizeTodos(note.todos)
  };
}

function getNoteStatus(note: Pick<Note, "is_completed">): NoteStatusFilter {
  return note.is_completed ? "completed" : "active";
}

function sortNotes(notes: Note[]) {
  return [...notes].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

type NotesByStatus = Record<NoteStatusFilter, Note[] | null>;

type UseNotesOptions = {
  initialNotes?: Note[];
  initialStatusFilter?: NoteStatusFilter;
  statusFilter: NoteStatusFilter;
};

export function useNotes(user: User | null, options: UseNotesOptions) {
  const { initialNotes, initialStatusFilter = "active", statusFilter } = options;
  const supabase = useMemo(() => createClient(), []);
  const userId = user?.id ?? null;
  const hasInitialNotes = initialNotes !== undefined;
  const initialNoteList = initialNotes ?? [];
  const [notesByStatus, setNotesByStatus] = useState<NotesByStatus>(() => ({
    active: hasInitialNotes && initialStatusFilter === "active" ? sortNotes(initialNoteList.map(toNote)) : null,
    completed: hasInitialNotes && initialStatusFilter === "completed" ? sortNotes(initialNoteList.map(toNote)) : null
  }));
  const [loadedFilters, setLoadedFilters] = useState<NoteStatusFilter[]>(() =>
    hasInitialNotes ? [initialStatusFilter] : []
  );
  const [loading, setLoading] = useState(!hasInitialNotes);
  const [error, setError] = useState<string | null>(null);

  const syncNote = useCallback((nextNote: Note) => {
    const targetStatus = getNoteStatus(nextNote);

    setNotesByStatus((current) => {
      const next: NotesByStatus = { ...current };

      statusFilters.forEach((filter) => {
        const list = current[filter];

        if (!list) {
          return;
        }

        const withoutNote = list.filter((item) => item.id !== nextNote.id);
        next[filter] = filter === targetStatus ? sortNotes([nextNote, ...withoutNote]) : withoutNote;
      });

      return next;
    });
  }, []);

  const removeNoteFromLists = useCallback((id: string) => {
    setNotesByStatus((current) => ({
      active: current.active?.filter((note) => note.id !== id) ?? null,
      completed: current.completed?.filter((note) => note.id !== id) ?? null
    }));
  }, []);

  const loadNotes = useCallback(
    async (nextStatusFilter: NoteStatusFilter, force = false) => {
      if (!userId) {
        setNotesByStatus({ active: [], completed: [] });
        setLoadedFilters(statusFilters);
        setLoading(false);
        return;
      }

      if (!force && loadedFilters.includes(nextStatusFilter)) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("notes")
        .select(NOTE_SELECT)
        .eq("user_id", userId)
        .eq("is_completed", nextStatusFilter === "completed")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("메모를 불러오지 못했습니다.");
        setLoading(false);
        return;
      }

      setNotesByStatus((current) => ({
        ...current,
        [nextStatusFilter]: sortNotes((data ?? []).map(toNote))
      }));
      setLoadedFilters((current) =>
        current.includes(nextStatusFilter) ? current : [...current, nextStatusFilter]
      );
      setLoading(false);
    },
    [loadedFilters, supabase, userId]
  );

  useEffect(() => {
    loadNotes(statusFilter);
  }, [loadNotes, statusFilter]);

  async function createNote(input: NoteInput) {
    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }

    const { data, error: insertError } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: input.title,
        content: input.content,
        todos: input.todos,
        background_color: input.background_color,
        is_important: input.is_important,
        is_completed: input.is_completed
      })
      .select(NOTE_SELECT)
      .single();

    if (insertError || !data) {
      throw new Error("저장하지 못했습니다. 다시 시도해 주세요.");
    }

    syncNote(toNote(data));
  }

  async function updateNote(id: string, input: NoteInput) {
    const { data, error: updateError } = await supabase
      .from("notes")
      .update({
        title: input.title,
        content: input.content,
        todos: input.todos,
        background_color: input.background_color,
        is_important: input.is_important,
        is_completed: input.is_completed
      })
      .eq("id", id)
      .select(NOTE_SELECT)
      .single();

    if (updateError || !data) {
      throw new Error("수정하지 못했습니다. 다시 시도해 주세요.");
    }

    syncNote(toNote(data));
  }

  async function deleteNote(id: string) {
    const { error: deleteError } = await supabase.from("notes").delete().eq("id", id);

    if (deleteError) {
      throw new Error("삭제하지 못했습니다. 다시 시도해 주세요.");
    }

    removeNoteFromLists(id);
  }

  async function toggleImportant(note: Note) {
    const { data, error: updateError } = await supabase
      .from("notes")
      .update({ is_important: !note.is_important })
      .eq("id", note.id)
      .select(NOTE_SELECT)
      .single();

    if (updateError || !data) {
      throw new Error("중요 표시를 변경하지 못했습니다.");
    }

    syncNote(toNote(data));
  }

  async function toggleCompleted(note: Note) {
    const { data, error: updateError } = await supabase
      .from("notes")
      .update({ is_completed: !note.is_completed })
      .eq("id", note.id)
      .select(NOTE_SELECT)
      .single();

    if (updateError || !data) {
      throw new Error("완료 상태를 변경하지 못했습니다.");
    }

    syncNote(toNote(data));
  }

  async function updateTodos(note: Note, todos: TodoItem[]) {
    const { data, error: updateError } = await supabase
      .from("notes")
      .update({ todos })
      .eq("id", note.id)
      .select(NOTE_SELECT)
      .single();

    if (updateError || !data) {
      throw new Error("할일 상태를 변경하지 못했습니다.");
    }

    syncNote(toNote(data));
  }

  const isStatusLoaded = loadedFilters.includes(statusFilter);

  return {
    createNote,
    deleteNote,
    error,
    fetchNotes: () => loadNotes(statusFilter, true),
    loading: !isStatusLoaded || loading,
    notes: notesByStatus[statusFilter] ?? [],
    toggleCompleted,
    toggleImportant,
    updateNote,
    updateTodos
  };
}
