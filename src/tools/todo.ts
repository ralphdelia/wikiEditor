import { tool, RunContext } from "@openai/agents";
import { z } from "zod";
import { Bus } from "../bus";
import { Todo } from "../todo";
import { Log } from "../log";

let log = Log.create("todo");

export const todoWrite = tool({
  name: "todoWrite",
  description: "",
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
      id = "unknonwn";
    }

    log.info("todo-publish", {
      run: id,
      prompt: prompt.slice(0, 60),
      todos: todos.map((t, i) => `${i + 1}. ${t.action}`).join(".\n"),
    });
    Bus.publish("todo-publish", { todos, id, prompt });

    return {
      output: JSON.stringify(todos, null, 2),
      metadata: {
        title: `${todos.filter((t) => t.status !== "completed").length} todos`,
        todos,
      },
    };
  },
});

export const todoRead = tool({
  name: "todoRead",
  description: "",
  parameters: z.object({}),
  execute: async (empty, opt?: RunContext<{ id: string }>) => {
    const id = opt?.context.id;
    const todos = Todo.get(id!);

    const title = Array.isArray(todos)
      ? `${todos.filter((t) => t.status !== "completed").length} todos`
      : todos;

    return {
      output: JSON.stringify(todos, null, 2),
      metadata: {
        title,
        todos,
      },
    };
  },
});
