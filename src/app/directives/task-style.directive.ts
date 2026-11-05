import { Directive, HostBinding, Input } from '@angular/core';
import { TaskPriority } from '../models/task';

interface TaskStyle {
  completed: boolean;
  priority: TaskPriority;
}

@Directive({ selector: '[appTaskStyle]', standalone: true })
export class TaskStyleDirective {
  private taskStyle: TaskStyle = { completed: false, priority: 'medium' };

  @Input({ required: true })
  set appTaskStyle(value: TaskStyle) {
    this.taskStyle = value;
  }

  // Host bindings keep task-state styling declarative and update it with each observable emission.
  @HostBinding('class.is-complete')
  get isComplete(): boolean {
    return this.taskStyle.completed;
  }

  @HostBinding('class.is-high-priority')
  get isHighPriority(): boolean {
    return this.taskStyle.priority === 'high' && !this.taskStyle.completed;
  }

  @HostBinding('class.is-low-priority')
  get isLowPriority(): boolean {
    return this.taskStyle.priority === 'low' && !this.taskStyle.completed;
  }
}
