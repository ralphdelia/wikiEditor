import { Agent, run } from "@openai/agents";
import INSTRUCTIONS from "./prompts/wikiEditor.txt";
import { write } from "../tools/write";
import { read } from "../tools/read";
import { list } from "../tools/list";
import { glob } from "../tools/glob";
import { move } from "../tools/mv";
import { patch } from "../tools/patch";
import { remove } from "../tools/rm";
import { search } from "../tools/search";
import { mkdir } from "../tools/mkdir";
import { Bus } from "../bus";
import { Todo } from "../todo";
import { Service } from "../services";
import { Log } from "../log";

export namespace WikiEditor {
  let log = Log.create("wikieditor");

  const runAgent = async (prompt: string, id: string) => {
    const agent = new Agent<{ id: string; prompt: string }>({
      name: "WikiEditor",
      instructions: INSTRUCTIONS,
      tools: [read, write, list, glob, move, patch, remove, search, mkdir],
    });

    agent.on("agent_tool_start", ({ context }, tool) => {
      log.info(`tool call ${tool.name}`, { id: context.id });
    });

    const todos = Todo.get(id) || [];
    if (todos.length === 0) log.warn("No todos found");
    for (const todo of todos) {
      log.info("task start", {
        id,
        task: todo.action,
      });

      await run(
        agent,
        `
        Corpus: ${prompt}
        All tasks: ${JSON.stringify(todos, null, 2)}
        Your task: ${todo}
        `,
        { context: { id, prompt } },
      );
      todo.status = "completed";
    }
  };

  Service.register("wikieditor", () => {
    Bus.subscribe("todo-publish", async ({ detail }) => {
      await runAgent(detail.prompt, detail.id);
    });
  });
}
