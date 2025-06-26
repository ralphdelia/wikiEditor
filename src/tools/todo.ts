import { tool, RunContext } from "@openai/agents";
import { z } from "zod";
import { Bus } from "../bus";
import { Todo } from "../todo";
import { Log } from "../log";
import INSTRUCTIONS from "./todoWrite.txt";
let log = Log.create("todo");

export const todoWrite = tool({
  name: "todoWrite",
  description: INSTRUCTIONS,
  parameters: z.object({
    todos: z.array(Todo.TodoInfoSchema).describe("the updated todo list"),
  }),
  execute: async (
    args: { todos: Todo.TodoInfo[] },
    opt?: RunContext<{ id: string; prompt: string }>,
  ) => {
    const todos = args.todos;
    let id = opt?.context?.id;
    const prompt = opt?.context?.prompt ?? "";

    if (!id) {
      log.warn("No id passed in todoWrite context.");

      return {
        output: "",
        metadata: {
          published: false,
        },
      };
    }

    Todo.set(id, todos);

    return {
      output: todos,
      metadata: {
        title: `${todos.filter((t) => t.status !== "completed").length} todos`,
        id,
        prompt,
      },
    };
  },
});

// export const todoRead = tool({
//   name: "todoRead",
//   description: "",
//   parameters: z.object({}),
//   execute: async (empty, opt?: RunContext<{ id: string }>) => {
//     const id = opt?.context.id;
//     const todos = Todo.get(id!);

//     const title = Array.isArray(todos)
//       ? `${todos.filter((t) => t.status !== "completed").length} todos`
//       : todos;

//     return {
//       output: JSON.stringify(todos, null, 2),
//       metadata: {
//         title,
//         todos,
//       },
//     };
//   },
// });
