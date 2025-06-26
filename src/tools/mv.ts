import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";
import { guardPath } from "./fsGuard";

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
    const vaultRoot = path.resolve(outVault);

    const srcGuard = guardPath(vaultRoot, from);
    const destGuard = guardPath(vaultRoot, to);
    if (!srcGuard.allowed || !destGuard.allowed) {
      return {
        metadata: {
          moved: false,
          reason: srcGuard.allowed ? destGuard.reason : srcGuard.reason,
        },
        output: "Error: Cannot move files outside the vault root.",
      };
    }

    const src = path.resolve(vaultRoot, from);
    const dest = path.resolve(vaultRoot, to);

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
