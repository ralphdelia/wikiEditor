import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';
import { outVault } from '../../vault';
import { readTextFile } from '../../utils/files';
import { tool } from '@openai/agents';
import { z } from 'zod';

async function vaultRead(relativePath: string): Promise<string> {
  return readTextFile(path.join(outVault, relativePath));
}

async function vaultWrite(relativePath: string, content: string): Promise<void> {
  const fullPath = path.join(outVault, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function listVault(dir: string = outVault): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listVault(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function globVault(pattern: string): string[] {
  return globSync(pattern, { cwd: outVault, absolute: true });
}

export const vaultReadTool = tool({
  name: 'vault_read',
  description: 'Read file from output vault',
  parameters: z.object({ path: z.string() }),
  execute: ({ path: p }) => vaultRead(p),
});

export const vaultWriteTool = tool({
  name: 'vault_write',
  description: 'Write file to output vault',
  parameters: z.object({ path: z.string(), content: z.string() }),
  execute: ({ path: p, content }) => {
    vaultWrite(p, content);
    return Promise.resolve('OK');
  },
});

export const listVaultTool = tool({
  name: 'vault_list',
  description: 'List all files in output vault',
  parameters: z.object({}),
  execute: () => Promise.resolve(listVault()),
});

export const globVaultTool = tool({
  name: 'vault_glob',
  description: 'Glob files in output vault',
  parameters: z.object({ pattern: z.string() }),
  execute: ({ pattern }) => Promise.resolve(globVault(pattern)),
});
