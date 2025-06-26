import { handoff, tool, RunContext } from "@openai/agents";
import { z } from "zod";
import { Log } from "../log";
import INSTRUCTIONS from "./todoWrite.txt";
import { wikiEditor } from "../agents/wikiEditor";

export namespace Todo {
  export const TodoInfoSchema = z.object({
    action: z
      .string()
      .min(1)
      .describe("Brief description of the task. (5- 8 words)"),
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

  let log = Log.create("todo");

  export const store = new Map<string, z.infer<typeof TodoInfoSchema>[]>(); // in-memory store

  export function getTodos(id: string) {
    return store.get(id) ?? [];
  }
}

export const todoWrite = tool({
  name: "todoWrite",
  description: INSTRUCTIONS,
  parameters: z.object({
    todos: z.array(Todo.TodoInfoSchema).describe("the updated todo list"),
  }),
  execute: async (
    { todos }: { todos: Todo.TodoInfo[] },
    opt?: RunContext<{ id: string; prompt: string }>,
  ) => {
    const id = opt?.context?.id;
    if (!id) {
      return { output: "Missing run id", metadata: { published: false } };
    }
    console.log(JSON.stringify(todos, null, 2));

    Todo.store.set(id, todos);

    return "Handoff to wikieditor";
  },
});
