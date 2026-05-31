"use client";

import type { User } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteList, type NoteViewMode } from "@/components/notes/NoteList";
import { useAuth } from "@/hooks/useAuth";
import { useImportantLinks } from "@/hooks/useImportantLinks";
import { useNoteSearch } from "@/hooks/useNoteSearch";
import { useNotes } from "@/hooks/useNotes";
import type { Note, NoteInput } from "@/types/note";

type DashboardViewProps = {
  initialUser: User;
};

const viewModes: Array<{ label: string; value: NoteViewMode }> = [
  { label: "기본", value: "grid" },
  { label: "날짜별", value: "date" },
  { label: "색상별", value: "color" },
  { label: "중요", value: "important" }
];

export function DashboardView({ initialUser }: DashboardViewProps) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<NoteViewMode>("grid");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const auth = useAuth(initialUser);
  const notes = useNotes(auth.user);
  const links = useImportantLinks(auth.user);
  const viewNotes = useMemo(() => {
    if (viewMode === "important") {
      return notes.notes.filter((note) => note.is_important);
    }

    return notes.notes;
  }, [notes.notes, viewMode]);
  const filteredNotes = useNoteSearch(viewNotes, query);

  const emptyLabel = useMemo(() => {
    if (query.trim()) {
      return "검색 결과가 없습니다.";
    }

    if (viewMode === "important") {
      return "중요 메모가 없습니다.";
    }

    return "아직 메모가 없습니다.";
  }, [query, viewMode]);

  function openNewNote() {
    setEditingNote(null);
    setEditorOpen(true);
  }

  function openEditNote(note: Note) {
    setEditingNote(note);
    setEditorOpen(true);
  }

  async function saveNote(input: NoteInput) {
    if (editingNote) {
      await notes.updateNote(editingNote.id, input);
      return;
    }

    await notes.createNote(input);
  }

  async function deleteNote(note: Note) {
    const confirmed = window.confirm(`"${note.title}" 메모를 삭제할까요?`);
    if (!confirmed) {
      return false;
    }

    setActionError(null);

    try {
      await notes.deleteNote(note.id);
      return true;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "삭제하지 못했습니다.");
      return false;
    }
  }

  async function guardedAction(action: () => Promise<void>) {
    setActionError(null);

    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "처리하지 못했습니다.");
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <Topbar
          linkError={links.error}
          links={links.links}
          onCreateLink={links.createLink}
          onDeleteLink={links.deleteLink}
          onNewNote={openNewNote}
          onQueryChange={setQuery}
          onSignOut={auth.signOut}
          query={query}
          user={auth.user}
        />
        <main className="dashboard-content">
          <div className="content-header">
            <div>
              <h1>Dashboard</h1>
            </div>
            <div className="view-toggle" aria-label="메모 보기 방식">
              {viewModes.map((item) => (
                <button
                  aria-pressed={viewMode === item.value}
                  className={`view-button ${viewMode === item.value ? "active" : ""}`}
                  key={item.value}
                  onClick={() => setViewMode(item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {notes.error || actionError ? <p className="status-message">{notes.error ?? actionError}</p> : null}
          <NoteList
            emptyLabel={emptyLabel}
            loading={notes.loading}
            notes={filteredNotes}
            onCreate={openNewNote}
            onEdit={openEditNote}
            onToggleImportant={(note) => guardedAction(() => notes.toggleImportant(note))}
            onUpdateTodos={(note, todos) => guardedAction(() => notes.updateTodos(note, todos))}
            viewMode={viewMode}
          />
        </main>
      </div>
      {editorOpen ? (
        <NoteEditor note={editingNote} onClose={() => setEditorOpen(false)} onDelete={deleteNote} onSave={saveNote} />
      ) : null}
    </div>
  );
}
