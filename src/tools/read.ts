import path from "path";
import { outVault } from "../vault";
import { tool } from "@openai/agents";
import fs from "fs";
import { z } from "zod";

export const read = tool({
  name: "read",
  description:
    "Read a UTF-8 encoded Markdown file from the output vault. The path should be relative to the vault root.",
  parameters: z.object({
    path: z
      .string()
      .describe(
        "Path to the file, relative to the vault root. Must end with '.md'.",
      ),
  }),
  execute: async ({ path: p }) => {
    if (!p.endsWith(".md")) {
      return {
        metadata: { read: false, reason: "invalid_extension" },
        output: "Error: Only Markdown (.md) files can be read using this tool.",
      };
    }

    const fullPath = path.join(outVault, p);

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
