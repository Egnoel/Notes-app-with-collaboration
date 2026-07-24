import { Elysia } from "elysia";
import { z } from "zod";
import { openapi } from "@elysiajs/openapi";
import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
import cors from "@elysiajs/cors";
import notesRoute from "./routes/notes.routes";
import usersRoute from "./routes/users.routes";

const app = new Elysia()
  .use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(openapi({
    documentation: {
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths()
    }
  }))
  .use(betterAuthPlugin)
  .get("/", () => "Hello Elysia")
  .use(notesRoute)
  .use(usersRoute)
  .listen(3333);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
