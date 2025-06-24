import { Hono } from "hono";
import { serve } from "bun";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import MessageManager from "./message/manager";
import MessageProcessor from "./message/processor";
import { Bus } from "./bus/bus";

const messagesSchema = z.object({
  messages: z.array(z.any()),
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
    messages.forEach((message) => {
      Bus.publish("message-incomming", { id: crypto.randomUUID(), message });
    });

    return c.json({ status: "Message received" });
  },
);

serve({ fetch: app.fetch });
