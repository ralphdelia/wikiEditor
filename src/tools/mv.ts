import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";

export const move = tool({
  name: "move",
  description: "Move or rename a file or directory within the vault.",
  parameters: z.object({
    from: z
      .string()
      .describe(
        "Current path of the file or directory, relative to the vault root.",
      ),
    to: z
      .string()
      .describe(
        "New path for the file or directory, relative to the vault root.",
      ),
  }),
  execute: async ({ from, to }) => {
    const src = path.resolve(outVault, from);
    const dest = path.resolve(outVault, to);
    const vaultRoot = path.resolve(outVault);

    if (
      !src.startsWith(vaultRoot + path.sep) ||
      !dest.startsWith(vaultRoot + path.sep)
    ) {
      return {
        metadata: { moved: false, reason: "outside_vault" },
        output: "Error: Cannot move files outside the vault root.",
      };
    }

    try {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.rename(src, dest);
      return {
        metadata: { moved: true, from, to },
        output: `Moved: ${from} → ${to}`,
      };
    } catch (err) {
      return {
        metadata: { moved: false },
        output: `Error moving '${from}': ${(err as Error).message}`,
      };
    }
  },
});
