import { Bus } from "../bus";
import { z } from "zod";
import { Service } from "../services";

export namespace Todo {
  export const TodoInfoSchema = z.object({
    action: z.string().min(1).describe("Brief description of the task"),
    status: z
      .enum(["pending", "completed"])
      .describe("Current status of the task"),
    content: z.string().describe(`
        A summary of the content relevent for this step
        or context to provide as reasoning for the action
        `),
    id: z.string().describe("Unique identifier for the todo item"),
  });

  export type TodoInfo = z.infer<typeof TodoInfoSchema>;

  const storage = new Map<string, TodoInfo[]>();

  export const get = (id: string) => storage.get(id) || null;

  Service.register("todo", () => {
    const unsubTodoPublish = Bus.subscribe("todo-publish", ({ detail }) => {
      const { id, todos } = detail;
      storage.set(id, todos);
    });
  });
}
