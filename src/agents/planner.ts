import { Agent, run } from "@openai/agents";
import { readTextFile } from "../utils/files";
import {
  globVaultTool,
  listVaultTool,
  vaultReadTool,
} from "./tools/vaultTools";

namespace Planner {
  let agent: Agent;

  export async function exe(prompt: string) {
    if (!agent) {
      const plannerInstructions = await readTextFile("./prompts/planner.txt");
      agent = new Agent({
        name: "Assistant",
        instructions: plannerInstructions,
        tools: [vaultReadTool, globVaultTool, listVaultTool],
      });
    }
    return await run(agent, prompt);
  }
}

export { Planner };
