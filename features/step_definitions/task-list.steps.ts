import { strict as assert } from "node:assert";

import {
  Given,
  Then,
  When,
} from "@cucumber/cucumber";

import { buildApp } from "../../src/app.js";
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
