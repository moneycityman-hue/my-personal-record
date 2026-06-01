"use client";

import { CheckCircle2, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { Note, TodoItem } from "@/types/note";

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onToggleCompleted: (note: Note) => Promise<void>;
  onToggleImportant: (note: Note) => Promise<void>;
  onUpdateTodos: (note: Note, todos: TodoItem[]) => Promise<void>;
};

function limitTodoText(text: string) {
  return text.length > 50 ? `${text.slice(0, 50)}` : text;
}

function linkifyContent(content: string) {
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const isUrlPattern = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i;
  const parts = content.split(urlPattern);

  return parts.map((part, index) => {
    if (!isUrlPattern.test(part)) {
      return part;
    }

    const href = part.startsWith("www.") ? `https://${part}` : part;

    return (
      <a className="note-content-link" href={href} key={`${part}-${index}`} rel="noreferrer" target="_blank">
        {part}
      </a>
    );
  });
}

export function NoteCard({ note, onEdit, onToggleCompleted, onToggleImportant, onUpdateTodos }: NoteCardProps) {
  async function handleTodoToggle(todoId: string, completed: boolean) {
    const todos = note.todos.map((todo) => (todo.id === todoId ? { ...todo, completed } : todo));
    await onUpdateTodos(note, todos);
  }

  return (
    <article
      className={`note-card ${note.is_completed ? "completed" : ""}`}
      style={{ background: note.background_color || "#FFFFFF" }}
    >
      <div className="note-card-header">
        <div className="note-title-area">
          <h2>
            <button className="note-title-button" onClick={() => onEdit(note)} type="button">
              {note.title}
            </button>
          </h2>
          {note.is_completed ? <span className="note-status">완료됨</span> : null}
        </div>
        <div className="card-actions">
          <Button
            aria-label={note.is_completed ? "미완료로 되돌리기" : "메모 완료 처리"}
            iconOnly
            onClick={() => onToggleCompleted(note)}
          >
            {note.is_completed ? <RotateCcw size={17} /> : <CheckCircle2 size={17} />}
          </Button>
          <Button
            aria-label={note.is_important ? "중요 메모 해제" : "중요 메모로 표시"}
            iconOnly
            onClick={() => onToggleImportant(note)}
          >
            <Star fill={note.is_important ? "#111827" : "none"} size={17} />
          </Button>
        </div>
      </div>
      {note.content ? <p className="note-content">{linkifyContent(note.content)}</p> : null}
      {note.todos.length > 0 ? (
        <div className="todo-preview">
          {note.todos.slice(0, 4).map((todo) => (
            <label className={`todo-line ${todo.completed ? "completed" : ""}`} key={todo.id}>
              <input
                aria-label={`${todo.text} 완료 여부`}
                checked={todo.completed}
                onChange={(event) => handleTodoToggle(todo.id, event.target.checked)}
                type="checkbox"
              />
              <span title={todo.text}>{limitTodoText(todo.text)}</span>
            </label>
          ))}
        </div>
      ) : null}
      <div className="note-meta">생성일 {formatDate(note.created_at)}</div>
    </article>
  );
}
