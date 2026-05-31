"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Note, NoteInput, TodoItem } from "@/types/note";

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
    todos: sanitizeTodos(note.todos)
  };
}

export function useNotes(user: User | null) {
  const supabase = useMemo(() => createClient(), []);
  const userId = user?.id ?? null;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("메모를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    setNotes((data ?? []).map(toNote));
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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
        is_important: input.is_important
      })
      .select("*")
      .single();

    if (insertError || !data) {
      throw new Error("저장하지 못했습니다. 다시 시도해 주세요.");
    }

    const nextNote = toNote(data);

    setNotes((current) => [nextNote, ...current]);
  }

  async function updateNote(id: string, input: NoteInput) {
    const { data, error: updateError } = await supabase
      .from("notes")
      .update({
        title: input.title,
        content: input.content,
        todos: input.todos,
        background_color: input.background_color,
        is_important: input.is_important
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !data) {
      throw new Error("수정하지 못했습니다. 다시 시도해 주세요.");
    }

    const nextNote = toNote(data);

    setNotes((current) => current.map((item) => (item.id === id ? nextNote : item)));
  }

  async function deleteNote(id: string) {
    const { error: deleteError } = await supabase.from("notes").delete().eq("id", id);

    if (deleteError) {
      throw new Error("삭제하지 못했습니다. 다시 시도해 주세요.");
    }

    setNotes((current) => current.filter((note) => note.id !== id));
  }

  async function toggleImportant(note: Note) {
    const { data, error: updateError } = await supabase
      .from("notes")
      .update({ is_important: !note.is_important })
      .eq("id", note.id)
      .select("*")
      .single();

    if (updateError || !data) {
      throw new Error("중요 표시를 변경하지 못했습니다.");
    }

    const nextNote = toNote(data);

    setNotes((current) => current.map((item) => (item.id === note.id ? nextNote : item)));
  }

  async function updateTodos(note: Note, todos: TodoItem[]) {
    const { data, error: updateError } = await supabase
      .from("notes")
      .update({ todos })
      .eq("id", note.id)
      .select("*")
      .single();

    if (updateError || !data) {
      throw new Error("할일 상태를 변경하지 못했습니다.");
    }

    const nextNote = toNote(data);
    setNotes((current) => current.map((item) => (item.id === note.id ? nextNote : item)));
  }

  return {
    createNote,
    deleteNote,
    error,
    fetchNotes,
    loading,
    notes,
    toggleImportant,
    updateNote,
    updateTodos
  };
}
