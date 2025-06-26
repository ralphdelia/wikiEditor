import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";
import { z } from "zod";
import * as fs from "fs/promises";
import { guardPath } from "./fsGuard";

export const write = tool({
  name: "write",
  description:
    "Write a Markdown (.md) file to the output vault. The path should be relative to the vault root.",
  parameters: z.object({
    path: z
      .string()
      .describe(
        "Path to the Markdown file, relative to the vault root. For example: 'notes/todo.md'",
      ),
    content: z.string().describe("The string content to write to the file"),
  }),
  execute: async ({ path: relPath, content }) => {
    if (!relPath.endsWith(".md")) {
      return {
        metadata: { written: false, reason: "invalid_extension" },
        output:
          "Error: Only Markdown (.md) files can be written using this tool.",
      };
    }

    const vaultRoot = path.resolve(outVault);
    const fullPath = path.resolve(outVault, relPath);

    const { allowed, reason } = guardPath(vaultRoot, relPath);
    if (!allowed) {
      return {
        metadata: { written: false, reason },
        output: "Error: Cannot write files outside the vault root.",
      };
    }

    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf8");
      return {
        metadata: { written: true, file: relPath },
        output: `Written: ${relPath}`,
      };
    } catch (err) {
      return {
        metadata: { written: false, reason: "write_failed" },
        output: `Error writing file '${relPath}': ${(err as Error).message}`,
      };
    }
  },
});
