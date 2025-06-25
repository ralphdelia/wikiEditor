import "./bootstrap";
import { Hono } from "hono";
import { serve } from "bun";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Bus } from "./bus";
import { Log } from "./log";

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
      const payload = { id: crypto.randomUUID(), message };
      log.info("message-incoming", { id: payload.id });
      Bus.publish("message-incoming", payload);
    });

    return c.json({ status: "Message received" });
  },
);

serve({ fetch: app.fetch });
