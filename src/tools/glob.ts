import path from "path";
import { outVault } from "../vault";
import { tool } from "@openai/agents";
import { z } from "zod";

export const glob = tool({
  name: "glob",
  description:
    "Search for files in the output vault using a glob pattern relative to the vault root.",
  parameters: z.object({
    pattern: z
      .string()
      .describe("Glob pattern to match files, e.g. '**/*.md' relative to the vault root."),
    path: z
      .string()
      .describe(
        "Optional subdirectory relative to the vault root; defaults to root. Use empty string to search root.",
      ),
  }),
  execute: async ({ pattern, path: relDir }) => {
    const searchDir = relDir ? path.resolve(outVault, relDir) : outVault;

    const glob = new Bun.Glob(pattern);
    const limit = 100;
    const files: string[] = [];
    let truncated = false;

    for await (const relPath of glob.scan({ cwd: searchDir, dot: false })) {
      if (files.length >= limit) {
        truncated = true;
        break;
      }
      files.push(path.resolve(searchDir, relPath));
    }

    const output: string[] = [];
    if (files.length === 0) {
      output.push("No files found");
    } else {
      output.push(...files);
      if (truncated) {
        output.push("");
        output.push(
          "(Results are truncated. Use a narrower pattern or directory.)",
        );
      }
    }

    return {
      metadata: {
        count: files.length,
        truncated,
        directory: path.relative(outVault, searchDir),
      },
      output: output.join("\n"),
    };
  },
});
