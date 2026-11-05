# AngularApp2

A daily task tracker with a small focus timer for MWD4B Angular Assignment 2.

## Run the app

Install the packages and start Angular's development server:

```bash
npm install
npm start
```

Open `http://localhost:4200/`. Create tasks with a title, optional note, due date, and priority. Use the task filters to switch between all, active, and completed work. Choose **Focus** on an active task to start a 25-minute focus session. Completed sessions are counted on the task.

Create a production build with:

```bash
npm run build
```

## Angular concepts in this project

- `TaskService` is provided at the root through Angular dependency injection. It stores tasks in memory and publishes immutable updates through an RxJS `BehaviorSubject` observable.
- The root component reads the task stream with Angular's `async` pipe, so the view owns and releases that subscription.
- `TaskDuePipe` formats due dates as today, tomorrow, overdue, or a readable date. It parses date-only values in local time to avoid timezone shifts.
- `TaskStyleDirective` applies completion and priority classes to each task row through host bindings.
- The focus timer uses an RxJS interval, stops on pause/reset, and uses `takeUntilDestroyed` to clean up with the component.

All task and focus data is held in memory and resets when the page is refreshed.
