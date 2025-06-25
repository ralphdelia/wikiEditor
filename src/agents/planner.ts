import { Bus } from "../bus";
import { Agent, run } from "@openai/agents";
import { read } from "../tools/read";
import INSTRUCTIONS from "./prompts/planner.txt";
import { search } from "../tools/search";
import { list } from "../tools/list";
// import { glob } from "../tools/glob";
import { todoWrite } from "../tools/todo";
import { Service } from "../services";
import { Log } from "../log";

export namespace Planner {
  const log = Log.create("planner");

  export async function runAgent(prompt: string, id: string) {
    const agent = new Agent({
      name: "Planner",
      instructions: INSTRUCTIONS,
      tools: [read, search, list, todoWrite],
    });

    agent.on("agent_tool_start", ({ context }, tool) => {
      log.info(id, { event: `tool call ${tool.name}` });
    });

    log.info(id, { event: "planner start" });
    return await run(agent, prompt, { context: { id, prompt } });
  }

  Service.register("planner", () => {
    Bus.subscribe("message-incoming", ({ detail }) => {
      runAgent(detail.message, detail.id);
    });
  });
}
