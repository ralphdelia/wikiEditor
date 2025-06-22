export async function readTextFile(path: string): Promise<string> {
  const file = Bun.file(path);
  const content = await file.text();
  return content;
}
