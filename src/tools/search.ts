import { z } from "zod";
import fs from "fs";
import path from "path";
import { tool } from "@openai/agents";
import { outVault } from "../vault";

export const search = tool({
  name: "search",
  description:
    "Search for a term in vault markdown files case-insensitively across optional subdirectory.",
  parameters: z.object({
    term: z.string().describe("Search term to match in file contents"),
    path: z
      .string()
      .describe(
        "Optional subdirectory relative to vault root; use empty string to search root.",
      ),
  }),
  execute: async ({ term, path: relDir }) => {
    const baseDir = relDir ? path.resolve(outVault, relDir) : outVault;

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

    const output: string[] = [];
    if (results.length === 0) {
      output.push("No matches found.");
    } else {
      output.push(...results);
      if (truncated) {
        output.push("");
        output.push("(Results are truncated. Try narrowing your search.)");
      }
    }

    return {
      metadata: {
        count: results.length,
        truncated,
        directory: path.relative(outVault, baseDir),
        term,
      },
      output: output.join("\n"),
    };
  },
});
