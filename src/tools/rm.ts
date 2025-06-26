import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";
import { guardPath } from "./fsGuard";

export const remove = tool({
  name: "remove",
  description:
    "Remove a file or directory from the vault. Directories will be deleted recursively.",
  parameters: z.object({
    relPath: z
      .string()
      .describe(
        "Path to the file or directory to remove, relative to the vault root.",
      ),
  }),
  execute: async ({ relPath }) => {
    const fullPath = path.resolve(outVault, relPath);
    const vaultRoot = path.resolve(outVault);

    const guard = guardPath(vaultRoot, relPath);
    if (!guard.allowed) {
      return {
        metadata: { removed: false, reason: guard.reason },
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
