import { Agent, run } from "@openai/agents";
import INSTRUCTIONS from "./prompts/wikiEditor.txt";
import { write } from "../tools/write";
import { read } from "../tools/read";
import { list } from "../tools/list";
import { move } from "../tools/mv";
import { patch } from "../tools/patch";
import { remove } from "../tools/rm";
import { search } from "../tools/search";
import { mkdir } from "../tools/mkdir";
import { Bus } from "../bus";
import { Todo } from "../todo";
import { Log } from "../log";

export namespace WikiEditor {
  let log = Log.create("wikieditor");

  const runAgent = async (prompt: string, id: string) => {
    const agent = new Agent<{ id: string; prompt: string }>({
      name: "WikiEditor",
      instructions: INSTRUCTIONS,
      tools: [read, write, list, move, patch, remove, search, mkdir],
    });

    let memory = "";

    agent.on("agent_tool_start", ({ context }, tool) => {
      log.info(id, { event: `tool call ${tool.name}` });
    });
    agent.on("agent_tool_end", (_evt, tool, output) => {
      memory += `\n[${tool.name} output]\n${output}`;
    });

    let todos = Todo.get(id) || [];
    if (todos.length === 0) log.warn("No todos found");
    for (const todo of todos) {
      log.info(id, { ["task-start"]: todo.action });

      await run(
        agent,
        `
        Memory: ${memory.trim() || "[none]"}
        Corpus: ${prompt}
        All tasks: ${JSON.stringify(todos, null, 2)}
        Your task: ${JSON.stringify(todo, null, 2)}
        `,
        { context: { id, prompt } },
      );

      memory += `\n[Task ${todo.id} completed]\n`;
      todo.status = "completed";
    }
  };

  Bus.subscribe("todo-publish", async ({ detail }) => {
    await runAgent(detail.prompt, detail.id);
  });
}
