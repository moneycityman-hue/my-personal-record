"use client";

import { FormEvent, useState } from "react";
import { ColorPicker } from "./ColorPicker";
import { TodoList } from "./TodoList";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { Note, NoteInput, TodoItem } from "@/types/note";

type NoteEditorProps = {
  note?: Note | null;
  onClose: () => void;
  onDelete?: (note: Note) => Promise<boolean>;
  onSave: (input: NoteInput) => Promise<void>;
};

function compactTodos(todos: TodoItem[]) {
  return todos
    .map((todo) => ({ ...todo, text: todo.text.trim().slice(0, 50) }))
    .filter((todo) => todo.text.length > 0);
}

export function NoteEditor({ note, onClose, onDelete, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState((note?.title ?? "").slice(0, 20));
  const [content, setContent] = useState((note?.content ?? "").slice(0, 500));
  const [todos, setTodos] = useState<TodoItem[]>(note?.todos ?? []);
  const [backgroundColor, setBackgroundColor] = useState(note?.background_color ?? "#FFFFFF");
  const [isImportant, setIsImportant] = useState(note?.is_important ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        title: title.trim().slice(0, 20),
        content: content.trim().slice(0, 500),
        todos: compactTodos(todos),
        background_color: backgroundColor,
        is_important: isImportant
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!note || !onDelete) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const deleted = await onDelete(note);
      if (deleted) {
        onClose();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "삭제하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} title={note ? "메모 수정" : "새 메모"}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="note-title">제목</label>
          <Input id="note-title" maxLength={20} onChange={(event) => setTitle(event.target.value)} value={title} />
        </div>
        <div className="field-group">
          <label htmlFor="note-content">내용</label>
          <Textarea
            id="note-content"
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
            value={content}
          />
        </div>
        <div className="field-group">
          <label>할일</label>
          <TodoList editable onChange={setTodos} todos={todos} />
        </div>
        <div className="field-group">
          <label>배경색</label>
          <ColorPicker onChange={setBackgroundColor} value={backgroundColor} />
        </div>
        <label className="checkbox-row">
          <input checked={isImportant} onChange={(event) => setIsImportant(event.target.checked)} type="checkbox" />
          중요 메모
        </label>
        {error ? <p className="status-message">{error}</p> : null}
        <div className="form-footer split">
          <div>
            {note ? (
              <Button disabled={saving} onClick={handleDelete} variant="danger">
                삭제
              </Button>
            ) : null}
          </div>
          <div className="form-actions">
            <Button onClick={onClose}>취소</Button>
            <Button disabled={saving} type="submit" variant="primary">
              저장
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
