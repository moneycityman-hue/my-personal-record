"use client";

import { Plus } from "lucide-react";
import { NoteCard } from "./NoteCard";
import { Button } from "@/components/ui/Button";
import { formatDateKey, formatDateLabel } from "@/lib/utils";
import type { Note, TodoItem } from "@/types/note";

export type NoteViewMode = "grid" | "date" | "color" | "important";

type NoteListProps = {
  emptyLabel: string;
  loading: boolean;
  notes: Note[];
  onCreate: () => void;
  onEdit: (note: Note) => void;
  onToggleImportant: (note: Note) => Promise<void>;
  onUpdateTodos: (note: Note, todos: TodoItem[]) => Promise<void>;
  viewMode: NoteViewMode;
};

type NoteGroup = {
  key: string;
  label: string;
  color?: string;
  notes: Note[];
};

const colorLabels: Record<string, string> = {
  "#FFFFFF": "White",
  "#FEF3C7": "Soft Yellow",
  "#DCFCE7": "Soft Green",
  "#DBEAFE": "Soft Blue",
  "#FCE7F3": "Soft Pink",
  "#EDE9FE": "Soft Purple"
};

function getDateKey(value: string) {
  return formatDateKey(value);
}

function getDateLabel(value: string) {
  return formatDateLabel(value);
}

function groupNotes(notes: Note[], viewMode: Exclude<NoteViewMode, "grid" | "important">): NoteGroup[] {
  const groups = new Map<string, NoteGroup>();

  notes.forEach((note) => {
    const key = viewMode === "date" ? getDateKey(note.created_at) : note.background_color || "#FFFFFF";
    const label = viewMode === "date" ? getDateLabel(note.created_at) : colorLabels[key] ?? key;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label,
        color: viewMode === "color" ? key : undefined,
        notes: []
      });
    }

    groups.get(key)?.notes.push(note);
  });

  return Array.from(groups.values());
}

function renderCards(
  notes: Note[],
  handlers: Pick<NoteListProps, "onEdit" | "onToggleImportant" | "onUpdateTodos">
) {
  return (
    <div className="note-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={handlers.onEdit}
          onToggleImportant={handlers.onToggleImportant}
          onUpdateTodos={handlers.onUpdateTodos}
        />
      ))}
    </div>
  );
}

export function NoteList({
  emptyLabel,
  loading,
  notes,
  onCreate,
  onEdit,
  onToggleImportant,
  onUpdateTodos,
  viewMode
}: NoteListProps) {
  const handlers = { onEdit, onToggleImportant, onUpdateTodos };

  if (loading) {
    return (
      <div className="empty-state">
        <p>메모를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyLabel}</p>
        <Button onClick={onCreate} variant="primary">
          <Plus size={17} />새 메모 만들기
        </Button>
      </div>
    );
  }

  if (viewMode === "grid" || viewMode === "important") {
    return renderCards(notes, handlers);
  }

  return (
    <div className="note-groups">
      {groupNotes(notes, viewMode).map((group) => (
        <section className="note-group" key={group.key}>
          <div className="note-group-title">
            {group.color ? <span className="color-dot" style={{ background: group.color }} /> : null}
            <span>{group.label}</span>
          </div>
          {renderCards(group.notes, handlers)}
        </section>
      ))}
    </div>
  );
}
