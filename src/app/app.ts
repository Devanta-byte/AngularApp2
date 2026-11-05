import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { Task, TaskPriority } from './models/task';
import { TaskDuePipe } from './pipes/task-due.pipe';
import { TaskStyleDirective } from './directives/task-style.directive';
import { TaskService } from './services/task.service';

type TaskFilter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, FormsModule, TaskDuePipe, TaskStyleDirective, TitleCasePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);
  private timerSubscription?: Subscription;

  // The async pipe owns the task stream subscription and releases it with the view.
  readonly tasks$ = this.taskService.tasks$;
  readonly filters: TaskFilter[] = ['all', 'active', 'completed'];
  readonly focusLengthSeconds = 25 * 60;

  currentFilter: TaskFilter = 'all';
  title = '';
  description = '';
  dueDate = this.localDateOffset(1);
  priority: TaskPriority = 'medium';
  selectedTaskId = 'task-1';
  secondsRemaining = this.focusLengthSeconds;
  isTimerRunning = false;
  timerMessage = '';

  get formattedTime(): string {
    const minutes = Math.floor(this.secondsRemaining / 60);
    const seconds = this.secondsRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get dueToday(): string {
    return this.localDateOffset(0);
  }

  get timerDashOffset(): number {
    const circumference = 2 * Math.PI * 88;
    return circumference * (1 - this.secondsRemaining / this.focusLengthSeconds);
  }

  setFilter(filter: TaskFilter): void {
    this.currentFilter = filter;
  }

  visibleTasks(tasks: Task[]): Task[] {
    if (this.currentFilter === 'active') return tasks.filter((task) => !task.completed);
    if (this.currentFilter === 'completed') return tasks.filter((task) => task.completed);
    return tasks;
  }

  countTasks(tasks: Task[], filter: TaskFilter): number {
    if (filter === 'active') return tasks.filter((task) => !task.completed).length;
    if (filter === 'completed') return tasks.filter((task) => task.completed).length;
    return tasks.length;
  }

  focusedTask(tasks: Task[]): Task | undefined {
    return tasks.find((task) => task.id === this.selectedTaskId);
  }

  addTask(): void {
    const cleanTitle = this.title.trim();
    if (!cleanTitle) return;

    const task = this.taskService.addTask({
      title: cleanTitle,
      description: this.description.trim(),
      dueDate: this.dueDate || null,
      priority: this.priority,
    });

    this.selectedTaskId = task.id;
    this.currentFilter = 'all';
    this.title = '';
    this.description = '';
    this.priority = 'medium';
    this.dueDate = this.localDateOffset(1);
    this.timerMessage = 'Task added. Ready when you are.';
  }

  toggleTask(task: Task): void {
    this.taskService.toggleTask(task.id);
    if (task.id === this.selectedTaskId && !task.completed) {
      this.resetTimer();
      this.timerMessage = 'Task completed. Your focus timer has been reset.';
    }
  }

  selectFocusTask(task: Task): void {
    if (task.completed) return;
    this.selectedTaskId = task.id;
    this.resetTimer();
    this.timerMessage = '';
  }

  startTimer(task: Task | undefined): void {
    if (!task || task.completed || this.isTimerRunning) return;

    this.isTimerRunning = true;
    this.timerMessage = `Focus on “${task.title}”. You’ve got this.`;

    // The timer stops on pause and is also tied to the component's destruction lifecycle.
    this.timerSubscription = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.secondsRemaining <= 1) {
          this.secondsRemaining = 0;
          this.finishFocusSession(task.id);
          return;
        }
        this.secondsRemaining -= 1;
      });
  }

  pauseTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
    this.isTimerRunning = false;
    this.timerMessage = 'Timer paused. Take a breath, then continue.';
  }

  resetTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
    this.isTimerRunning = false;
    this.secondsRemaining = this.focusLengthSeconds;
  }

  trackById(_index: number, task: Task): string {
    return task.id;
  }

  private finishFocusSession(taskId: string): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
    this.isTimerRunning = false;
    this.taskService.recordFocusSession(taskId);
    this.timerMessage = 'Session complete. Nice work showing up for yourself.';
    this.secondsRemaining = this.focusLengthSeconds;
  }

  private localDateOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
