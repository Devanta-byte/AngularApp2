export type TaskPriority = 'low' | 'medium' | 'high';

/** The task shape shared by the component and the in-memory TaskService. */
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: TaskPriority;
  completed: boolean;
  focusSessions: number;
}

export type NewTask = Pick<Task, 'title' | 'description' | 'dueDate' | 'priority'>;
