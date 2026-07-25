import { randomUUID } from "node:crypto";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskStore = {
  getAll(): readonly Task[];
  add(title: string): Task;
  complete(id: string): Task | undefined;
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
    complete(id) {
      const taskIndex = tasks.findIndex((task) => task.id === id);

      if (taskIndex === -1) {
        return undefined;
      }

      const completedTask = {
        ...tasks[taskIndex],
        completed: true,
      };

      tasks[taskIndex] = completedTask;
      return completedTask;
    },
  };
}
