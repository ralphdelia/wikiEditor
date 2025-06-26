import "./bootstrap";
import { Hono } from "hono";
import { serve } from "bun";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Log } from "./log";
import { runPlanner } from "./agents/planner";

const app = new Hono();
let log = Log.create("api");

app.post(
  "/messages",
  zValidator(
    "json",
    z.object({
      messages: z.array(z.any()),
    }),
    (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.format() }, 400);
      }
    },
  ),
  (c) => {
    const { messages } = c.req.valid("json");
    messages.forEach((message) => {
      runPlanner(crypto.randomUUID(), message);
    });
    return c.json({ status: "Message received" });
  },
);

serve({ fetch: app.fetch });
