import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";

export const remove = tool({
  name: "remove",
  description:
    "Remove a file or directory from the vault. Directories will be deleted recursively.",
  parameters: z.object({
    path: z
      .string()
      .describe(
        "Path to the file or directory to remove, relative to the vault root.",
      ),
  }),
  execute: async ({ path: relPath }) => {
    const fullPath = path.resolve(outVault, relPath);
    const vaultRoot = path.resolve(outVault);

    if (!fullPath.startsWith(vaultRoot + path.sep)) {
      return {
        metadata: { removed: false, reason: "outside_vault" },
        output: "Error: Cannot remove files outside the vault root.",
      };
    }

    try {
      await fs.rm(fullPath, { recursive: true, force: true });
      return {
        metadata: { removed: true, path: relPath },
        output: `Removed: ${relPath}`,
      };
    } catch (err) {
      return {
        metadata: { removed: false },
        output: `Error removing '${relPath}': ${(err as Error).message}`,
      };
    }
  },
});
