import path from "path";
import { outVault } from "../vault";
import { tool } from "@openai/agents";
import fs from "fs";
import { z } from "zod";
import { guardPath } from "./fsGuard";

export const read = tool({
  name: "read",
  description:
    "Read a UTF-8 markdown file from the vault; path relative to vault root.",
  parameters: z.object({
    path: z
      .string()
      .describe("File path relative to vault root; must end in '.md'."),
  }),
  execute: async ({ path: p }) => {
    if (!p.endsWith(".md")) {
      return {
        metadata: { read: false, reason: "invalid_extension" },
        output: "Error: Only Markdown (.md) files can be read using this tool.",
      };
    }

    const fullPath = path.join(outVault, p);
    const { allowed, reason } = guardPath(outVault, p);
    if (!allowed) {
      return {
        metadata: { read: false, reason },
        output: "Error: Cannot read files outside the vault root.",
      };
    }

    try {
      const content = fs.readFileSync(fullPath, "utf8");
      return {
        metadata: { read: true, file: p },
        output: content,
      };
    } catch (err) {
      return {
        metadata: { read: false, reason: "read_failed" },
        output: `Error reading file '${p}': ${(err as Error).message}`,
      };
    }
  },
});
