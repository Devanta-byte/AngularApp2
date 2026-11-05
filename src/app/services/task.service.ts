import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NewTask, Task } from '../models/task';

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  // BehaviorSubject keeps the latest in-memory state and broadcasts every immutable update.
  private readonly taskState = new BehaviorSubject<Task[]>([
    {
      id: 'task-1',
      title: 'Review today’s Angular notes',
      description: 'Revisit pipes, directives, and how observables keep the view in sync.',
      dueDate: dateOffset(0),
      priority: 'high',
      completed: false,
      focusSessions: 0,
    },
    {
      id: 'task-2',
      title: 'Sketch the next project idea',
      description: 'Keep it simple: one problem, one person, one useful first feature.',
      dueDate: dateOffset(1),
      priority: 'medium',
      completed: false,
      focusSessions: 1,
    },
    {
      id: 'task-3',
      title: 'Tidy up the workspace',
      description: 'Close old tabs and make a little room to think.',
      dueDate: dateOffset(3),
      priority: 'low',
      completed: true,
      focusSessions: 0,
    },
  ]);

  readonly tasks$ = this.taskState.asObservable();

  addTask(details: NewTask): Task {
    const task: Task = {
      ...details,
      id: globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}`,
      completed: false,
      focusSessions: 0,
    };
    this.taskState.next([task, ...this.taskState.value]);
    return task;
  }

  toggleTask(taskId: string): void {
    this.taskState.next(
      this.taskState.value.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  recordFocusSession(taskId: string): void {
    this.taskState.next(
      this.taskState.value.map((task) =>
        task.id === taskId ? { ...task, focusSessions: task.focusSessions + 1 } : task,
      ),
    );
  }
}
