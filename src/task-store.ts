export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskStore = {
  getAll(): readonly Task[];
};

export function createInMemoryTaskStore(
  initialTasks: readonly Task[] = [],
): TaskStore {
  const tasks = [...initialTasks];

  return {
    getAll() {
      return tasks;
    },
  };
}
