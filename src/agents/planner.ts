import { Bus } from "../bus";
import { Agent, run } from "@openai/agents";
import { read } from "../tools/read";
import INSTRUCTIONS from "./prompts/planner.txt";
import { search } from "../tools/search";
import { list } from "../tools/list";
import { glob } from "../tools/glob";
import { todoWrite } from "../tools/todo";
import { Service } from "../services";
import { Log } from "../log";

export namespace Planner {
  let agent: Agent<{ id: string; prompt: string }, "text">;
  const log = Log.create("planner");

  export async function runAgent(prompt: string, id: string) {
    if (!agent) {
      agent = new Agent({
        name: "Planner",
        instructions: INSTRUCTIONS,
        tools: [read, search, list, glob, todoWrite],
      });
    }

    log.info("agent-event", { agent: agent.name, type: "planner-start" });

    const res = await run(agent, prompt, { context: { id, prompt } });
    log.info("agent-event", {
      agent: agent.name,
      type: "planner-end",
      description: res.finalOutput || "",
    });
    return res;
  }

  Service.register("planner", () => {
    const unsub = Bus.subscribe("message-incoming", ({ detail }) => {
      runAgent(detail.message, detail.id);
    });
  });
}
