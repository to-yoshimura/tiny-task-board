import { randomUUID } from "node:crypto";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskStore = {
  getAll(): readonly Task[];
  add(title: string): Task;
};

export function createInMemoryTaskStore(
  initialTasks: readonly Task[] = [],
): TaskStore {
  const tasks = [...initialTasks];

  return {
    getAll() {
      return tasks;
    },
    add(title) {
      const task = {
        id: randomUUID(),
        title,
        completed: false,
      };

      tasks.push(task);
      return task;
    },
  };
}
