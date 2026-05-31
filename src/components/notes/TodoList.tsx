"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TodoItem } from "@/types/note";

type TodoListProps = {
  todos: TodoItem[];
  editable?: boolean;
  onChange?: (todos: TodoItem[]) => void;
};

function createTodo(): TodoItem {
  return {
    id: crypto.randomUUID(),
    text: "",
    completed: false
  };
}

export function TodoList({ editable = false, onChange, todos }: TodoListProps) {
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const inputRefs = useRef(new Map<string, HTMLInputElement>());

  useEffect(() => {
    if (!pendingFocusId) {
      return;
    }

    const input = inputRefs.current.get(pendingFocusId);

    if (input) {
      input.focus();
      setPendingFocusId(null);
    }
  }, [pendingFocusId, todos]);

  function updateTodo(id: string, patch: Partial<TodoItem>) {
    onChange?.(todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)));
  }

  function addTodo() {
    const nextTodo = createTodo();
    setPendingFocusId(nextTodo.id);
    onChange?.([...todos, nextTodo]);
  }

  if (!editable) {
    return (
      <div className="todo-preview">
        {todos.slice(0, 4).map((todo) => (
          <label className={`todo-line ${todo.completed ? "completed" : ""}`} key={todo.id}>
            <input checked={todo.completed} readOnly type="checkbox" />
            <span>{todo.text}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="todo-editor">
      {todos.map((todo) => (
        <div className={`todo-editor-row ${todo.completed ? "completed" : ""}`} key={todo.id}>
          <input
            aria-label={`${todo.text || "할일"} 완료 여부`}
            checked={todo.completed}
            onChange={(event) => updateTodo(todo.id, { completed: event.target.checked })}
            type="checkbox"
          />
          <Input
            aria-label="할일 내용"
            maxLength={50}
            onChange={(event) => updateTodo(todo.id, { text: event.target.value })}
            placeholder="할일"
            ref={(element) => {
              if (element) {
                inputRefs.current.set(todo.id, element);
              } else {
                inputRefs.current.delete(todo.id);
              }
            }}
            value={todo.text}
          />
          <Button
            aria-label="할일 삭제"
            iconOnly
            onClick={() => onChange?.(todos.filter((item) => item.id !== todo.id))}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
      <Button onClick={addTodo}>
        <Plus size={16} />
        할일 추가
      </Button>
    </div>
  );
}
