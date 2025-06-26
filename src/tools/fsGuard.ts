import path from "path";

export function guardPath(
  vaultRoot: string,
  targetPath: string,
): { allowed: boolean; reason?: string } {
  const root = path.resolve(vaultRoot);
  const target = path.resolve(vaultRoot, targetPath);
  const rel = path.relative(root, target);
  if (rel.startsWith("..") || (path.isAbsolute(rel) && rel !== "")) {
    return { allowed: false, reason: "outside_vault" };
  }
  return { allowed: true };
}
