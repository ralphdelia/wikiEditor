import { Hono } from "hono";
import { serve } from "bun";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import MessageManager from "./message/manager";
import MessageProcessor from "./message/processor";

const messagesSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant", "tool"]),
      content: z.string().nullable(),
      name: z.string().optional(),
    }),
  ),
});

const app = new Hono();
const manager = new MessageManager();
const processor = new MessageProcessor(manager);
void processor.run().catch(console.error);

app.get("/test", (c) => c.text("Test route is working!"));

app.post(
  "/messages",
  zValidator("json", messagesSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: result.error.format() }, 400);
    }
  }),
  (c) => {
    const { messages } = c.req.valid("json");
    manager.addMessages(messages as ChatCompletionMessageParam[]);
    return c.json({ status: "Message received" });
  },
);

serve({ fetch: app.fetch });
