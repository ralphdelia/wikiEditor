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

export namespace WikiEditor {
  let agent: Agent;

  const runAgent = async (id: string, prompt: string) => {
    if (!agent) {
      agent = new Agent({
        name: "WikiEditor",
        instructions: INSTRUCTIONS,
        tools: [read, write, list, glob, move, patch, remove, search, mkdir],
      });
    }

    for (const todo of Todo.get(id) || []) {
      Bus.publish("agent-event", {
        agent: agent.name,
        type: "todo-start",
        desc: todo.action,
      });

      await run(
        agent,
        `
        Corpus: ${prompt}
        All tasks: ${JSON.stringify(Todo.get(todo.id), null, 2)}
        Your task: ${todo}
        `,
      );
      todo.status = "completed";
      Bus.publish("agent-event", {
        agent: agent.name,
        type: "todo-end",
        desc: todo.action,
      });
    }
  };

  Service.register("wikieditor", () => {
    Bus.subscribe("todo-publish", async ({ detail }) => {
      runAgent(detail.id, detail.prompt);
    });
  });
}
