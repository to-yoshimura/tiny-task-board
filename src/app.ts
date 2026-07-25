import Fastify, { type FastifyInstance } from "fastify";

export function buildApp(): FastifyInstance {
  const app = Fastify();

  app.get("/", async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <title>Tiny Task Board</title>
  </head>
  <body>
    <h1>Tiny Task Bored</h1>
  </body>
</html>`);
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
