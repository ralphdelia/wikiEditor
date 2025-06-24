import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";

export const patch = tool({
  name: "patch",
  description:
    "Patch a Markdown file by replacing lines that match given strings.",
  parameters: z.object({
    path: z
      .string()
      .describe("Path to the Markdown file, relative to the vault root."),
    patch: z
      .array(
        z.object({
          match: z.string().describe("The line to find (must match exactly)."),
          replace: z.string().describe("The line to replace it with."),
        }),
      )
      .describe(
        "List of patch operations, replacing lines based on exact match.",
      ),
  }),
  execute: async ({ path: relPath, patch }) => {
    const fullPath = path.resolve(outVault, relPath);

    try {
      let text = await fs.readFile(fullPath, "utf8");
      let lines = text.split("\n");
      let changed = false;

      for (const { match, replace } of patch) {
        const i = lines.findIndex((line) => line === match);
        if (i !== -1) {
          lines[i] = replace;
          changed = true;
        }
      }

      if (!changed) {
        return {
          metadata: { patched: false },
          output: "No lines matched. File unchanged.",
        };
      }

      await fs.writeFile(fullPath, lines.join("\n"), "utf8");

      return {
        metadata: { patched: true, count: patch.length },
        output: `Patched ${relPath}`,
      };
    } catch (err) {
      return {
        metadata: { patched: false },
        output: `Error patching file: ${(err as Error).message}`,
      };
    }
  },
});
