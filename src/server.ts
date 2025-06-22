import { Hono } from "hono";
import { serve } from "bun";
import MessageManager from "./message/manager";
import MessageProcessor from "./message/processor";

import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const app = new Hono();
const manager = new MessageManager();
const processor = new MessageProcessor(manager);
void processor.run().catch(console.error);

app.get("/test", (c) => c.text("Test route is working!"));

app.post("/messages", async (c) => {
  const { messages } = await c.req.json<{
    messages: ChatCompletionMessageParam[];
  }>();

  manager.addMessages(messages);
  return c.json({
    status: "Message received",
  });
});

serve({ fetch: app.fetch });
