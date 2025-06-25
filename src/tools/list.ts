import path from "path";
import fs from "fs";
import { outVault } from "../vault";
import { tool } from "@openai/agents";
import { z } from "zod";

export const list = tool({
  name: "list",
  description:
    "List all files in the output vault recursively. Returns file paths relative to the vault root.",
  parameters: z
    .object({})
    .describe("No parameters; lists all files in the vault recursively relative to the vault root."),
  execute: async () => {
    const results: string[] = [];
    const stack: string[] = [outVault];

    while (stack.length) {
      const current = stack.pop()!;
      const entries = fs.readdirSync(current, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(fullPath);
        } else {
          results.push(fullPath);
        }
      }
    }

    return results;
  },
});
