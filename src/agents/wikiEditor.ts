import { Agent, run } from "@openai/agents";
import { Todo } from "../tools/todo";

import INSTRUCTIONS from "./prompts/wikiEditor.txt";
import { write } from "../tools/write";
import { read } from "../tools/read";
import { list } from "../tools/list";
import { move } from "../tools/mv";
import { patch } from "../tools/patch";
import { remove } from "../tools/rm";
import { search } from "../tools/search";
import { mkdir } from "../tools/mkdir";

export const wikiEditor = new Agent<{ id: string; prompt: string }>({
  name: "WikiEditor",
  instructions: INSTRUCTIONS,
  tools: [read, write, list, move, patch, remove, search, mkdir],
});
