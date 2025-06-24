import { Agent, AgentHooks, run, tool } from "@openai/agents";
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

namespace WikiEditor {
  let agent: Agent;

  export async function exe(prompt: string) {
    if (!agent) {
      agent = new Agent({
        name: "WikiEditor",
        instructions: INSTRUCTIONS,
        tools: [read, write, list, glob, move, patch, remove, search, mkdir],
      });

      agent.on("agent_start", (ctx, agent) => {
        console.log(`${agent.name} started`);
      });
      agent.on("agent_end", (ctx, output) => {
        console.log(`[agent] ended`);
      });
      agent.on("agent_tool_start", (ctx, tool) => {
        console.log(`${tool.name} called`);
      });
      agent.on("agent_tool_end", (ctx, tool) => {
        console.log(`${tool.name} ended`);
      });
    }
    return await run(agent, prompt);
  }
}

export { WikiEditor };
