import { Bus } from "../bus/bus";
import { Agent, run } from "@openai/agents";

export namespace Planner {
  let agent: Agent;
  const unsub = Bus.subscribe("message-created", ({ detail }) => {
    exe(detail.message);
  });

  export async function exe(prompt: string) {
    if (!agent) {
      agent = new Agent({
        name: "Planner",
        instructions: "placeholder",
        tools: [],
      });
    }
    return await run(agent, prompt);
  }
}
