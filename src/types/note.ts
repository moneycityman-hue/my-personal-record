export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  todos: TodoItem[];
  background_color: string;
  is_important: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type NoteInput = {
  title: string;
  content: string;
  todos: TodoItem[];
  background_color: string;
  is_important: boolean;
  is_completed: boolean;
};

export type NoteStatusFilter = "active" | "completed";
