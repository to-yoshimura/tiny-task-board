import {
  After,
  setWorldConstructor,
  World,
} from "@cucumber/cucumber";
import type {
  FastifyInstance,
  LightMyRequestResponse,
} from "fastify";

import type { Task } from "../../src/task-store.js";

export class TaskBoardWorld extends World {
  initialTasks: Task[] = [];
  app: FastifyInstance | undefined;
  response: LightMyRequestResponse | undefined;
}

setWorldConstructor(TaskBoardWorld);

After(async function (this: TaskBoardWorld) {
  await this.app?.close();
});
