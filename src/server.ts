import "./bootstrap";
import { Hono } from "hono";
import { serve } from "bun";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Bus } from "./bus";

const app = new Hono();

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
    console.log(messages);
    messages.forEach((message) => {
      Bus.publish("message-incoming", { id: crypto.randomUUID(), message });
    });

    return c.json({ status: "Message received" });
  },
);

serve({ fetch: app.fetch });
