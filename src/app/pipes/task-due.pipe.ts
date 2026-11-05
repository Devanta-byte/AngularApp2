import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'taskDue', standalone: true, pure: true })
export class TaskDuePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'No due date';

    // Parse date-only input as local time so browsers do not shift it across time zones.
    const [year, month, day] = value.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    if (Number.isNaN(dueDate.getTime())) return 'No due date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate < today) return `Overdue · ${this.formatDate(dueDate)}`;
    if (dueDate.getTime() === today.getTime()) return 'Due today';
    if (dueDate.getTime() === tomorrow.getTime()) return 'Due tomorrow';
    return `Due ${this.formatDate(dueDate)}`;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
  }
}
