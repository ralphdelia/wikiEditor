import { Log } from "../log";
import { Todo } from "../tools/todo";

import { Agent, run, handoff, RunContext } from "@openai/agents";
import { z } from "zod";

import INSTRUCTIONS from "./prompts/planner.txt";
import { read } from "../tools/read";
import { search } from "../tools/search";
import { list } from "../tools/list";
import { todoWrite } from "../tools/todo";
import { wikiEditor } from "./wikiEditor";

const log = Log.create("planner");

const tSchema = z.object({ todos: z.array(Todo.TodoInfoSchema) });

export async function runPlanner(id: string, prompt: string) {
  const planner = new Agent<{ id: string; prompt: string }, typeof tSchema>({
    name: "Planner",
    instructions: INSTRUCTIONS,
    tools: [read, search, list, todoWrite],
    outputType: z.object({ todos: z.array(Todo.TodoInfoSchema) }),
  });

  planner.on("agent_tool_start", ({ context }, tool) => {
    log.info(id, { event: `tool call ${tool.name}` });
  });

  log.info(id, { event: "planner start" });
  let ctx = { context: { id, prompt } };
  const { finalOutput } = await run(planner, prompt, ctx);
  console.log("Planner final output:", finalOutput, ctx);

  let memory = "";
  if (finalOutput) {
    for (const todo of finalOutput.todos) {
      const input = {
        memory,
        corpus: prompt,
        todos: finalOutput.todos,
        yourTodo: todo,
      };
      let res = await run(wikiEditor, JSON.stringify(input, null, 2), ctx);
      memory += JSON.stringify(res);
      memory += `${todo.id} complete`;
    }
  }
}
