import { strict as assert } from "node:assert";

import {
  Given,
  Then,
  When,
} from "@cucumber/cucumber";

import { buildApp } from "../../src/app.js";
import type { Task } from "../../src/task-store.js";
import type { TaskBoardWorld } from "../support/world.js";

Given(
  "タスクが1件も存在しない",
  function (this: TaskBoardWorld) {
    this.initialTasks = [];
  },
);

Given(
  "{string} という未完了タスクが存在する",
  function (this: TaskBoardWorld, title: string) {
    this.initialTasks = [
      {
        id: "task-1",
        title,
        completed: false,
      },
    ];
  },
);

When(
  "利用者がタスクボードを開く",
  async function (this: TaskBoardWorld) {
    this.app = buildApp({ initialTasks: this.initialTasks });
    this.response = await this.app.inject({
      method: "GET",
      url: "/",
    });
  },
);

When(
  "利用者が {string} というタスクを登録する",
  async function (this: TaskBoardWorld, title: string) {
    this.app = buildApp({ initialTasks: this.initialTasks });
    this.response = await this.app.inject({
      method: "POST",
      url: "/tasks",
      payload: { title },
    });
  },
);

Then("登録は成功する", function (this: TaskBoardWorld) {
  assert.ok(this.response, "タスク登録のレスポンスがありません");
  assert.equal(this.response.statusCode, 201);
});

Then(
  "{string} が未完了タスクとして存在する",
  function (this: TaskBoardWorld, title: string) {
    assert.ok(this.response, "タスク登録のレスポンスがありません");

    const task = this.response.json<Task>();

    assert.equal(typeof task.id, "string");
    assert.notEqual(task.id, "");
    assert.equal(task.title, title);
    assert.equal(task.completed, false);
  },
);

Then(
  "タスクボードを開くと {string} と表示される",
  async function (this: TaskBoardWorld, title: string) {
    assert.ok(this.app, "Fastifyアプリケーションがありません");

    this.response = await this.app.inject({
      method: "GET",
      url: "/",
    });

    assert.ok(
      this.response.body.includes(title),
      `レスポンスに "${title}" が含まれていません`,
    );
  },
);

Then(
  "{string} と表示される",
  function (this: TaskBoardWorld, text: string) {
    assert.ok(this.response, "GET / のレスポンスがありません");
    assert.ok(
      this.response.body.includes(text),
      `レスポンスに "${text}" が含まれていません`,
    );
  },
);

Then(
  "{string} は表示されない",
  function (this: TaskBoardWorld, text: string) {
    assert.ok(this.response, "GET / のレスポンスがありません");
    assert.ok(
      !this.response.body.includes(text),
      `レスポンスに "${text}" が含まれています`,
    );
  },
);
