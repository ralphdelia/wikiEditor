import { z } from "zod";
import fs from "fs";
import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";
import { guardPath } from "./fsGuard";

export const search = tool({
  name: "search",
  description:
    "Search for a term in vault markdown files case-insensitively across optional subdirectory.",
  parameters: z.object({
    term: z.string().describe("Search term to match in file contents"),
    relDirPath: z
      .string()
      .describe(
        "Optional subdirectory relative to vault root; use empty string to search root.",
      ),
  }),
  execute: async ({ term, relDirPath }) => {
    const vaultRoot = path.resolve(outVault);
    const { allowed, reason } = guardPath(vaultRoot, relDirPath);
    if (!allowed) {
      return {
        metadata: { count: 0, reason },
        output: "Error: Cannot search outside the vault root.",
      };
    }
    const baseDir = relDirPath
      ? path.resolve(vaultRoot, relDirPath)
      : vaultRoot;

    const results: string[] = [];
    const stack: string[] = [baseDir];
    const lowerTerm = term.toLowerCase();
    const limit = 100;
    let truncated = false;

    while (stack.length) {
      const current = stack.pop()!;
      const entries = fs.readdirSync(current, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);

        if (entry.isDirectory()) {
          stack.push(fullPath);
          continue;
        }

        if (!entry.name.endsWith(".md")) {
          continue;
        }

        try {
          const content = fs.readFileSync(fullPath, "utf8");
          if (content.toLowerCase().includes(lowerTerm)) {
            results.push(fullPath);
            if (results.length >= limit) {
              truncated = true;
              break;
            }
          }
        } catch {
          continue;
        }
      }

      if (truncated) break;
    }

    const outputLines: string[] = [];
    if (results.length === 0) {
      outputLines.push("No matches found.");
    } else {
      outputLines.push(...results);
      if (truncated) {
        outputLines.push("");
        outputLines.push("(Results are truncated. Try narrowing your search.)");
      }
    }

    return {
      metadata: {
        count: results.length,
        truncated,
        directory: path.relative(outVault, baseDir),
        term,
      },
      output: outputLines.join("\n"),
    };
  },
});
