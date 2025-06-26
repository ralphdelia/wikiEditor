import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";
import { guardPath } from "./fsGuard";

export const mkdir = tool({
  name: "mkdir",
  description:
    "Create a directory in the output vault. The path must be relative to the vault root.",
  parameters: z
    .object({
      path: z
        .string()
        .describe(
          "Directory path to create, relative to the vault root. For example: 'notes/2025'",
        ),
    })
    .describe("Parameters for creating a directory in the vault."),
  execute: async ({ path: relPath }) => {
    const fullPath = path.resolve(outVault, relPath);

    const { allowed, reason } = guardPath(outVault, relPath);
    if (!allowed) {
      return {
        metadata: { created: false, reason },
        output: "Error: Cannot create directories outside the vault root.",
      };
    }

    try {
      await fs.mkdir(fullPath, { recursive: true });
      return {
        metadata: { created: true, path: relPath },
        output: `Created directory: ${relPath}`,
      };
    } catch (err) {
      return {
        metadata: { created: false },
        output: `Error creating directory '${relPath}': ${(err as Error).message}`,
      };
    }
  },
});
